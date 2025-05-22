# Parking App IoT Simulator

This repository contains everything you need to deploy an Azure-based IoT simulation environment for a parking application. It provisions cloud infrastructure using Terraform, builds a Docker container with sensor simulators, and deploys it using Azure Container Instances.

---

## Table of Contents

1. [Repository Structure](#repository-structure)  
2. [Prerequisites](#prerequisites)  
3. [Deployment Overview](#deployment-overview)  
4. [Step-by-Step Guide](#step-by-step-guide)  
   1. [Clone the Repository](#clone-the-repository)  
   2. [Convert Line Endings](#convert-line-endings)  
   3. [Authenticate to Azure](#authenticate-to-azure)  
   4. [Initialize and Apply Terraform](#initialize-and-apply-terraform)  
   5. [Run Post-Deploy Script](#run-post-deploy-script)  
   6. [Verify Device Telemetry](#verify-device-telemetry)  
5. [Configuration Notes](#configuration-notes)  
6. [Local Development (Optional)](#local-development-optional)  
7. [Cleanup](#cleanup)  

---

## Repository Structure

```
IoT/
├── terraform/
│   ├── main.tf                     # Terraform configuration (IoT Hub, ACR, ACI, etc.)
│   ├── terraform.tfvars            # Input variables (device_type_counts)
│   └── post_deploy.sh              # Script to generate devices.conf
│
├── IoT_Hub/
│   ├── share/
│   │   └── devices.conf            # Generated device connection strings
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── entrypoint.py
│   ├── run_simulators.py
│   ├── base_simulator.py
│   └── sensor_ir/
│       ├── sensor_ir_simulator.py
│       ├── config.json
│       └── config-*.json          # Generated per device (entrypoint.py)
│
└── docker-compose.yml             # Local dev only
```

---

## Prerequisites

- **Linux** or **Windows** with **WSL**
- **Visual Studio Code** (recommended)
- **Azure CLI**
- **Terraform**
- **Docker Desktop**

Ensure all tools are available in your terminal and you have an Azure subscription with sufficient permissions.

---

## Deployment Overview

1. Provision infrastructure: IoT Hub, ACR, ACI, etc.
2. Build Docker image and push it to ACR
3. Generate device configuration (`devices.conf`)
4. Deploy container simulator to Azure
5. Monitor messages sent to IoT Hub

---

## Step-by-Step Guide

### 1. Convert Line Endings (CRLF → LF)

**Important:** Ensure all files use Unix-style LF endings. You can convert using VS Code:

1. Open each `.sh`, `.py`, `.tf`, etc.
2. Click bottom-right in VS Code (`CRLF`)
3. Change to `LF` and save

Alternatively, run:
```bash
find . -type f -exec dos2unix {} \;
```

### 2. Authenticate to Azure

```bash
az login
export ARM_SUBSCRIPTION_ID=$(az account show --query id --output tsv)
```

Ensure the correct subscription is active.

### 3. Initialize and Apply Terraform

```bash
cd terraform/
terraform init
terraform apply -auto-approve
```

This will:
- Build infrastructure
- Build & push Docker image
- Deploy simulator to ACI

### 5. Run Post-Deploy Script

```bash
chmod +x post_deploy.sh && ./post_deploy.sh
```

This will generate `devices.conf` and upload it to the configured Azure File Share.

### 6. Verify Device Telemetry

Monitor telemetry from your devices:

```bash
az iot hub monitor-events --hub-name IoT-Hub-Simulators
```

---

## Configuration Notes

### Modify Device Types

To change the number and type of devices, edit:

```hcl
# terraform/terraform.tfvars
device_type_counts = {
  ir = 10
}
```

Then re-apply Terraform.

### Modify Sensor Behavior

To adjust timings, precision, etc., edit:

```json
# IoT_Hub/sensor_ir/config.json
{
  ...
  
  "heartbeat_seconds": 600,
  "beam_count": 8,
  "occupancy_threshold": 6,
  "free_interval": 300,
  "occupied_interval": 900,
  "confirm_count": 3
}

```

> `config-*.json` files are generated automatically from `config.json` by `entrypoint.py`.

---

## Local Development (Optional)

Run simulators locally using Docker Compose:

```bash
docker-compose up --build
```

Ensure `devices.conf` is available is available in the `IoT_Hub/share/` directory. This setup runs containers without needing Azure.

---

## Cleanup

To delete all deployed resources:

```bash
cd terraform
terraform destroy -auto-approve
```

This will remove the IoT Hub, ACI, ACR, and associated Azure resources.

---

**End of guide.**
