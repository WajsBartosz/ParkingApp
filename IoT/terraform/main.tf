# Terraform configuration for deploying IoT simulators on Azure

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">=3.8.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = ">=2.0.0"
    }
  }
}

# Configure the Azure provider with default settings
provider "azurerm" {
  features {}
}

# Configure Docker provider using ACR credentials
provider "docker" {
  registry_auth {
    address  = azurerm_container_registry.acr.login_server
    username = azurerm_container_registry.acr.admin_username
    password = azurerm_container_registry.acr.admin_password
  }
}

# Map of sensor types to the number of simulator instances to create
variable "device_type_counts" {
  description = "Map of sensor types to the number of simulator instances to be created"
  type        = map(number)
}


# Azure region for all resources
variable "location" {
  description = "Azure region where resources will be deployed"
  type        = string
  default     = "uksouth"
}

# Resource group for all resources
resource "azurerm_resource_group" "rg" {
  name     = "IoT-Hub-Resource-Group"
  location = var.location
}

# IoT Hub resource
resource "azurerm_iothub" "hub" {
  name                = "IoT-Hub-Simulators"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku {
    name     = "B1"
    capacity = 1
  }
}

# Azure Container Registry for storing Docker images
resource "azurerm_container_registry" "acr" {
  name                = "IoTHubContainerRegistry0"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

# Build and push the simulator Docker image
resource "docker_image" "iot_simulator" {
  name = "${azurerm_container_registry.acr.login_server}/iot-simulator:latest"
  build {
    context    = "${path.module}/../IoT_Hub"
    dockerfile = "${path.module}/../IoT_Hub/Dockerfile"
  }
}

# Ensure the built image is retained in the registry
resource "docker_registry_image" "iot_simulator" {
  name          = docker_image.iot_simulator.name
  keep_remotely = true
}

# Storage account for device configuration files
resource "azurerm_storage_account" "sa" {
  name                     = "iothubstorageaccount0"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Azure File Share for storing dynamic devices.conf
resource "azurerm_storage_share" "share" {
  name               = "iot-hub-storage-share"
  storage_account_id = azurerm_storage_account.sa.id
  quota              = 1
}

# Outputs for post-deployment script integration
output "iot_hub_name" {
  description = "Name of the deployed IoT Hub"
  value       = azurerm_iothub.hub.name
}

output "resource_group" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.rg.name
}

output "storage_account" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.sa.name
}

output "storage_share" {
  description = "Name of the file share"
  value       = azurerm_storage_share.share.name
}

output "container_registry" {
  description = "Login server URL of the container registry"
  value       = azurerm_container_registry.acr.login_server
}

output "registry_username" {
  description = "Admin username for the container registry"
  value       = azurerm_container_registry.acr.admin_username
}

output "registry_password" {
  description = "Admin password for the container registry"
  value       = azurerm_container_registry.acr.admin_password
  sensitive   = true
}

output "device_type_counts" {
  description = "Map of sensor types to instance counts"
  value       = var.device_type_counts
}
