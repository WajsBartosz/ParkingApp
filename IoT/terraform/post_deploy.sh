#!/usr/bin/env bash

# post_deploy.sh
# =============================================================
# Post-deploy script for:
#   - creating IoT device identities
#   - generating and uploading devices.conf
#   - launching the Azure Container Instance for IoT simulators
# =============================================================

set -euo pipefail

echo ">>> post_deploy.sh starting..."

# Verify required CLI tools are available
echo "Checking prerequisites..."
for cmd in terraform az; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' CLI not found in PATH" >&2
    exit 1
  fi
done
echo "-> prerequisites OK"

# Retrieve Terraform outputs into variables
echo "Loading Terraform outputs..."
IOT_HUB_NAME=$(terraform output -raw iot_hub_name)
RG=$(terraform output -raw resource_group)
SA=$(terraform output -raw storage_account)
SHARE=$(terraform output -raw storage_share)
ACR=$(terraform output -raw container_registry)
USER=$(terraform output -raw registry_username)
PASS=$(terraform output -raw registry_password)
echo "-> outputs loaded: IoT Hub = $IOT_HUB_NAME, RG = $RG, Share = $SHARE"

# Parse the device_type_counts map from Terraform JSON output
echo "Parsing device counts..."
raw_map=$(terraform output -json device_type_counts)
declare -A COUNTS
# Remove surrounding braces and split into key:value pairs
trim=${raw_map#\{}
trim=${trim%\}}
IFS=',' read -ra PAIRS <<<"$trim"
for pair in "${PAIRS[@]}"; do
  key=$(sed -E 's/^.*"([^"]+)".*$/\1/' <<<"$pair")
  val=$(sed -E 's/^.*:([0-9]+).*$/\1/' <<<"$pair")
  COUNTS[$key]=$val
done
echo "-> found types: ${!COUNTS[*]}"

# Prepare file paths for devices.conf
echo "Setting up paths..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOT_DIR="$SCRIPT_DIR/../IoT_Hub"
CONF_PATH="$IOT_DIR/devices.conf"
echo "-> will write to $CONF_PATH"

# Create device identities in the IoT Hub
echo "Creating IoT device identities..."
for type in "${!COUNTS[@]}"; do
  count=${COUNTS[$type]}
  for ((i=1; i<=count; i++)); do
    id=$(printf "%s-%02d" "$type" "$i")
    az iot hub device-identity create \
      --hub-name "$IOT_HUB_NAME" \
      --device-id "$id" \
      --resource-group "$RG" \
      --only-show-errors \
      >/dev/null
    echo " - created $id"
  done
done

# Generate the devices.conf file with connection strings
echo "Generating devices.conf..."
: > "$CONF_PATH"
for type in "${!COUNTS[@]}"; do
  count=${COUNTS[$type]}
  for ((i=1; i<=count; i++)); do
    id=$(printf "%s-%02d" "$type" "$i")
    cs=$(az iot hub device-identity connection-string show \
      --hub-name "$IOT_HUB_NAME" \
      --device-id "$id" \
      --resource-group "$RG" \
      --query connectionString -o tsv)
    printf '%s="%s"\n' "$type" "$cs" >> "$CONF_PATH"
  done
done
echo "-> $(wc -l < "$CONF_PATH") entries written to devices.conf"

# Upload devices.conf to the Azure File Share
echo "Uploading devices.conf to Azure File Share..."
STORAGE_KEY=$(az storage account keys list \
  --resource-group "$RG" \
  --account-name "$SA" \
  --query "[0].value" -o tsv)
az storage file upload \
  --share-name "$SHARE" \
  --account-name "$SA" \
  --account-key "$STORAGE_KEY" \
  --source "$CONF_PATH" \
  --path devices.conf \
  --only-show-errors \
  >/dev/null
echo "-> upload complete"

# Deploy the container instance with mounted file share
echo "Creating Container Instance 'iot-simulators'..."
az container create \
  --resource-group "$RG" \
  --name iot-simulators \
  --image "$ACR/iot-simulator:latest" \
  --cpu 1 \
  --memory 1.5 \
  --os-type Linux \
  --restart-policy OnFailure \
  --registry-login-server "$ACR" \
  --registry-username "$USER" \
  --registry-password "$PASS" \
  --azure-file-volume-share-name "$SHARE" \
  --azure-file-volume-account-name "$SA" \
  --azure-file-volume-account-key "$STORAGE_KEY" \
  --azure-file-volume-mount-path "IoT_Hub/share" \
  --environment-variables LOG_LEVEL=ERROR \
  --only-show-errors \
  >/dev/null
echo "-> container created"

echo ">>> POST DEPLOY complete"
