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

provider "azurerm" {
  features {}
}

provider "docker" {
  registry_auth {
    address  = azurerm_container_registry.container-registry.login_server
    username = azurerm_container_registry.container-registry.admin_username
    password = azurerm_container_registry.container-registry.admin_password
  }
}

resource "azurerm_resource_group" "rg" {
  name     = "parking-app-rg"
  location = "francecentral"
}

# Azure region for all resources
variable "location" {
  description = "Azure region where resources will be deployed"
  type        = string
  default     = "uksouth"

resource "azurerm_mysql_flexible_server" "mysql" {
  name                   = "parking-app-mysql-suqoskbj"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  administrator_login    = ""
  administrator_password = ""
  version                = "8.0.21"
  sku_name               = "B_Standard_B1ms"
}

resource "azurerm_mysql_flexible_database" "mysql" {
  name                = "parking-app"
  resource_group_name = azurerm_resource_group.rg.name
  server_name         = azurerm_mysql_flexible_server.mysql.name
  charset             = "utf8"
  collation           = "utf8_unicode_ci"
}

resource "azurerm_mysql_flexible_server_firewall_rule" "mysql-firewall" {
  name                = "parking-app-fw-rule-allow"
  resource_group_name = azurerm_resource_group.rg.name
  server_name         = azurerm_mysql_flexible_server.mysql.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "255.255.255.255"
}

resource "azurerm_container_registry" "container-registry" {
  name                = "parkingAppContainerRegistry"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_service_plan" "parking-app-service-plan" {
  name                = "parking-app-web-app-service-plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_storage_account" "storage-account" {
  name                     = "parkingappstorageaccount"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}


variable "device_type_counts" {
  description = "Map of sensor types to the number of simulator instances to be created"
  type        = map(number)
}

resource "azurerm_iothub" "hub" {
  name                = "IoT-Hub-Simulators-suqoskbj"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku {
    name     = "B1"
    capacity = 1
  }
}

resource "azurerm_iothub_shared_access_policy" "iot_policy" {
  name                = "functionAccess"
  iothub_name         = azurerm_iothub.hub.name
  resource_group_name = azurerm_resource_group.rg.name

  registry_read   = true
  registry_write  = false
  service_connect = true
  device_connect  = false
}

resource "azurerm_linux_function_app" "example" {
  name                = "parking-app-function-app"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  storage_account_name       = azurerm_storage_account.storage-account.name
  storage_account_access_key = azurerm_storage_account.storage-account.primary_access_key
  service_plan_id            = azurerm_service_plan.parking-app-service-plan.id

  site_config {
    application_stack {
      python_version = "3.12"
    }
  }

  app_settings = {
    "WEBSITE_RUN_FROM_PACKAGE" = "1"
    "FUNCTIONS_WORKER_RUNTIME" = "python"
    "AzureWebJobsStorage"      = azurerm_storage_account.storage-account.primary_connection_string
    "DB_HOST"                  = azurerm_mysql_flexible_server.mysql.fqdn
    "DB_USER"                  = azurerm_mysql_flexible_server.mysql.administrator_login
    "DB_PASSWORD"              = azurerm_mysql_flexible_server.mysql.administrator_password
    "DB_NAME"                  = azurerm_mysql_flexible_database.mysql.name
  }
}

resource "docker_image" "iot_simulator" {
  name = "${azurerm_container_registry.container-registry.login_server}/iot-simulator:latest"
  build {
    context    = "${path.module}/../IoT_Hub"
    dockerfile = "${path.module}/../IoT_Hub/Dockerfile"
  }
}

resource "docker_registry_image" "iot_simulator" {
  name          = docker_image.iot_simulator.name
  keep_remotely = true
}

resource "azurerm_storage_share" "share" {
  name               = "iot-hub-storage-share"
  storage_account_id = azurerm_storage_account.storage-account.id
  quota              = 1
}

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
  value       = azurerm_storage_account.storage-account.name
}

output "storage_share" {
  description = "Name of the file share"
  value       = azurerm_storage_share.share.name
}

output "container_registry" {
  description = "Login server URL of the container registry"
  value       = azurerm_container_registry.container-registry.login_server
}

output "registry_username" {
  description = "Admin username for the container registry"
  value       = azurerm_container_registry.container-registry.admin_username
}

output "registry_password" {
  description = "Admin password for the container registry"
  value       = azurerm_container_registry.container-registry.admin_password
  sensitive   = true
}

output "device_type_counts" {
  description = "Map of sensor types to instance counts"
  value       = var.device_type_counts
}