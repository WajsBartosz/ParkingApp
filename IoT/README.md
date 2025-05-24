
# Parking App IoT Simulator

This project provides a full Azure-based IoT simulation environment for a parking application. It uses Terraform for cloud infrastructure provisioning, Docker for sensor simulation containers, and Azure CLI for monitoring and deployment.

---

## Table of Contents

1. [Repository Structure](#repository-structure)
2. [Requirements](#requirements)
3. [Setup Instructions](#setup-instructions)
4. [Configuration Notes](#configuration-notes)
5. [Local Development (Python Environment)](#local-development-python-environment)
6. [Local Development (Docker)](#local-development-docker)
7. [Cleanup](#cleanup)

---

## Repository Structure

```bash
Azure/
├── terraform/
│   ├── main.tf                       # Terraform configuration (IoT Hub, ACR, ACI, etc.)
│   ├── terraform.tfvars              # Input variables (device_type_counts)
│   └── post_deploy.sh                # Script to generate file with device connection strings
│
├── IoT_Hub/
│   ├── share/
│   │   └── devices.conf              # Generated device connection strings
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── entrypoint.py
│   ├── run_simulators.py
│   ├── base_simulator.py
│   └── sensor_ir/
│       ├── sensor_ir_simulator.py
│       ├── config.json
│       └── config-*.json            # Generated configs per device
│
├── .gitignore
└── docker-compose.yml               # Local dev only
```

---

## Requirements

- **Operating System**:
  - **POSIX**-compliant (*Linux*/*macOS* or *WSL*)
  - **Windows** (*PowerShell* or *Windows Terminal*)

- **Required Tools**:
  - [Python 3.12+](https://www.python.org/downloads/)
  - [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)  
    with *IoT Hub* extension:

    ```bash
    az extension add --name azure-iot
    ```

  - [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - [Terraform](https://developer.hashicorp.com/terraform/downloads)
  - [Visual Studio Code](https://code.visualstudio.com/) (recommended)

---

## Setup Instructions

### Convert Line Endings to LF

After cloning the repo:

> Use VS Code: click `CRLF` in the bottom-right and choose `LF`.

*or*

```bash
find . -type f -exec dos2unix {} \;
```

---

### Phase 0: Azure Login and Set Environment Variables

> **POSIX:**

```bash
az login
export ARM_SUBSCRIPTION_ID=$(az account show --query id --output tsv)
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

> **Windows PowerShell:**

```powershell
az login
$env:ARM_SUBSCRIPTION_ID = $(az account show --query id -o tsv)
$env:SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/..."
```

---

### Phase 1: Terraform Infrastructure Provisioning

```bash
cd terraform
terraform init
terraform apply -auto-approve -var-file="terraform.tfvars"
```

---

### Phase 2: Post-Deployment Script

> **POSIX:**

```bash
chmod +x post_deploy.sh && ./post_deploy.sh
```

> **Windows PowerShell:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\post_deploy.ps1
```

---

### Phase 3: Monitor Telemetry

```bash
az iot hub monitor-events --hub-name IoT-Hub-Simulators
```

#### Message Payload Format

> Each device sends telemetry to the IoT Hub, e.g.

```json
{
  "spot_id": "A1",
  "occupied": true,
  "timestamp": "2000-12-31 12:34:56"
}

```

|    Field    |  Type   |                                 Description                                 |
|-------------|---------|-----------------------------------------------------------------------------|
| `spot_id`   | String | parking spot number                                                        |
| `occupied`  | Boolean | indicates whether the parking spot is occupied (`true`) or free (`false`)  |
| `timestamp` | String  | ISO 8601 formatted UTC timestamp (e.g., `2000-12-31 12:34:56`)             |

#### Example: Updating Desired Properties via Azure CLI

Below are all the cases for modifying the simulator’s configuration at runtime using Device Twins. Replace <Hub_Name> and <Device_ID> with your actual IoT Hub name and device ID.

##### 1. Change heartbeat_seconds only

```bash
az iot hub device-twin update \
  --hub-name <Hub_Name> \
  --device-id <Device_ID> \
  --set properties.desired.heartbeat_seconds=600
```

##### 2. Change interval_seconds only

```bash
az iot hub device-twin update \
  --hub-name <Hub_Name> \
  --device-id <Device_ID> \
  --set properties.desired.interval_seconds=10
```

##### 3. Change beam_count and occupancy_threshold together

```bash
az iot hub device-twin update \
  --hub-name <Hub_Name> \
  --device-id <Device_ID> \
  --set properties.desired.beam_count=10 \
            properties.desired.occupancy_threshold=5
```

##### 4. Change free_interval and occupied_interval together

```bash
az iot hub device-twin update \
  --hub-name <Hub_Name> \
  --device-id <Device_ID> \
  --set properties.desired.free_interval=300 \
            properties.desired.occupied_interval=900
```

##### 5. Change confirm_count only

```bash
az iot hub device-twin update \
  --hub-name <Hub_Name> \
  --device-id <Device_ID> \
  --set properties.desired.confirm_count=3
```

##### 6. Change *all* configuration fields at once

```bash
az iot hub device-twin update \
  --hub-name <Hub_Name> \
  --device-id <Device_ID> \
  --set properties.desired.heartbeat_seconds=600 \
            properties.desired.interval_seconds=10 \
            properties.desired.beam_count=10 \
            properties.desired.occupancy_threshold=5 \
            properties.desired.free_interval=300 \
            properties.desired.occupied_interval=900 \
            properties.desired.confirm_count=3
```

```bash
az iot hub device-twin update \
  --device-id <device_id> \
  --hub-name <iot_hub_name> \
  --set properties.desired='{
    "heartbeat_seconds": 300,
    "interval_seconds": 10,
    "beam_count": 10,
    "occupancy_threshold": 5,
    "free_interval": 120,
    "occupied_interval": 240,
    "confirm_count": 3
  }'
```

> After running any of these, simulator’s device twin handler will pick up the new values immediately — no restart required.

---

## Configuration Notes

### Modify Device Count and Types

Edit `terraform/terraform.tfvars`:

```hcl
device_type_counts = {
  ir = 10
}
```

---

### Modify Sensor Behavior

Edit `IoT_Hub/sensor_ir/config.json`:

```json
{
  "heartbeat_seconds": 600,
  "interval_seconds": 10,
  "beam_count": 10,
  "occupancy_threshold": 5,
  "free_interval": 300,
  "occupied_interval": 900,
  "confirm_count": 3
}
```

> `config-*.json` files are generated by `entrypoint.py` based on `config.json` and `devices.conf`

---

## Local Development (Docker)

Ensure `devices.conf` is available in the `IoT_Hub/share/` directory. This setup runs containers without needing Azure (working IoT Hub and valid device connection strings are still required).

> Run simulators locally using Docker Compose:

```bash
docker-compose up --build
```

To stop and clean up:

```bash
docker-compose down -v
```

---

## Local Development (Python Environment)

Use the commands below to create and activate a Python virtual environment and install dependencies.

<table>
  <thead>
    <tr>
      <th>Platform</th>
      <th>Commands</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>POSIX (Linux/WSL/macOS)</strong></td>
      <td>
        <pre><code>python3 -m venv .venv
python3 -m pip install --upgrade pip
source .venv/bin/activate
pip install -r requirements.txt
deactivate</code></pre>
      </td>
    </tr>
    <tr>
      <td><strong>Windows PowerShell</strong></td>
      <td>
        <pre><code>py -m venv .venv
py -m pip install --upgrade pip
.venv\Scripts\activate
pip install -r requirements.txt
deactivate</code></pre>
      </td>
    </tr>
  </tbody>
</table>

---

## Cleanup

To delete all deployed resources:

```bash
cd terraform
terraform destroy -auto-approve
```

---

**End of guide.**
