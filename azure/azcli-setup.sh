#!/bin/bash

# CloudNotes Azure Setup Script
# This script helps set up Azure resources for CloudNotes application
# IMPORTANT: Replace placeholders before running!

echo "=== CloudNotes Azure Setup ==="
echo "This script will help you set up Azure resources for CloudNotes."
echo "Please replace all <PLACEHOLDER> values before running!"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Azure CLI is not installed. Please install it first:"
    echo "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged in
az account show &> /dev/null
if [ $? -ne 0 ]; then
    echo "Please log in to Azure CLI first:"
    echo "az login"
    exit 1
fi

# Configuration - REPLACE THESE VALUES
SUBSCRIPTION_ID="<YOUR_SUBSCRIPTION_ID>"
RESOURCE_GROUP="cloudnotes-rg"
LOCATION="eastus"
ENVIRONMENT="dev"
ADMIN_USERNAME="cloudnotesadmin"
ADMIN_PASSWORD="<STRONG_PASSWORD>"  # Replace with strong password

# Set subscription
echo "Setting subscription to: $SUBSCRIPTION_ID"
az account set --subscription "$SUBSCRIPTION_ID"

# Create resource group
echo "Creating resource group: $RESOURCE_GROUP"
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --tags environment="$ENVIRONMENT" project="cloudnotes"

# Deploy Bicep template
echo "Deploying Azure resources with Bicep..."
az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "../bicep/main.bicep" \
  --parameters "@../bicep/parameters.json" \
  --parameters \
    environmentName="$ENVIRONMENT" \
    adminUsername="$ADMIN_USERNAME" \
    adminPassword="$ADMIN_PASSWORD"

# Get deployment outputs
echo "Getting deployment outputs..."
POSTGRES_HOST=$(az deployment group show \
  --resource-group "$RESOURCE_GROUP" \
  --name "main" \
  --query properties.outputs.postgresHost.value \
  --output tsv)

STORAGE_ACCOUNT=$(az deployment group show \
  --resource-group "$RESOURCE_GROUP" \
  --name "main" \
  --query properties.outputs.storageAccountName.value \
  --output tsv)

KEY_VAULT=$(az deployment group show \
  --resource-group "$RESOURCE_GROUP" \
  --name "main" \
  --query properties.outputs.keyVaultName.value \
  --output tsv)

# Configure PostgreSQL firewall to allow Azure services
echo "Configuring PostgreSQL firewall..."
az postgres flexible-server firewall-rule create \
  --resource-group "$RESOURCE_GROUP" \
  --server-name "cloudnotes-${ENVIRONMENT}-psql" \
  --name "AllowAzureServices" \
  --start-ip-address "0.0.0.0" \
  --end-ip-address "0.0.0.0"

# Create storage connection string
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
  --resource-group "$RESOURCE_GROUP" \
  --name "$STORAGE_ACCOUNT" \
  --query connectionString \
  --output tsv)

# Store secrets in Key Vault
echo "Storing secrets in Key Vault..."
az keyvault secret set \
  --vault-name "$KEY_VAULT" \
  --name "PostgresConnectionString" \
  --value "postgresql://${ADMIN_USERNAME}:${ADMIN_PASSWORD}@${POSTGRES_HOST}/cloudnotes?sslmode=require"

az keyvault secret set \
  --vault-name "$KEY_VAULT" \
  --name "StorageConnectionString" \
  --value "$STORAGE_CONNECTION_STRING"

az keyvault secret set \
  --vault-name "$KEY_VAULT" \
  --name "JwtSecret" \
  --value "your-super-secret-jwt-key-here"

echo ""
echo "=== Setup Complete ==="
echo "PostgreSQL Host: $POSTGRES_HOST"
echo "Storage Account: $STORAGE_ACCOUNT"
echo "Key Vault: $KEY_VAULT"
echo ""
echo "Next steps:"
echo "1. Run database migrations"
echo "2. Deploy your application"
echo "3. Configure App Service to use Key Vault secrets"