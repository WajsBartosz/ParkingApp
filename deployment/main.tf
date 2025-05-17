terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.1"
    }
    time = {
      source  = "hashicorp/time"
      version = "~>0.9"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "parking-app-rg"
  location = "francecentral"
}

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

resource "azurerm_mysql_flexible_server_firewall_rule" "mysql_firewall" {
  name                = "parking-app-fw-rule-allow"
  resource_group_name = azurerm_resource_group.rg.name
  server_name         = azurerm_mysql_flexible_server.mysql.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "255.255.255.255"
}

resource "azurerm_container_registry" "container_registry" {
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