#!/bin/bash

# Stop on any error
set -e

# --- Configuration ---
# Replace these placeholders with your desired values

# The name of the resource group to create.
RESOURCE_GROUP="<RESOURCE_GROUP_NAME>"

# The Azure region where resources will be deployed.
LOCATION="<AZURE_REGION>" # e.g., "eastus"

# A unique prefix for your resources to avoid naming conflicts.
RESOURCE_PREFIX="<UNIQUE_PREFIX>" # e.g., "cn-furqan"

# The administrator username for the PostgreSQL server.
# IMPORTANT: Choose a strong, memorable username.
POSTGRES_ADMIN_USER="<POSTGRES_ADMIN_USERNAME>"

# The administrator password for the PostgreSQL server.
# IMPORTANT: Use a strong, secure password. Do not hardcode it here in a production script.
# For this learning exercise, you will be prompted to enter it.
echo "Please enter the password for the PostgreSQL administrator ($POSTGRES_ADMIN_USER):"
read -s POSTGRES_ADMIN_PASSWORD

# --- Script Execution ---

echo "Starting Azure resource deployment for CloudNotes..."

# 1. Login to Azure (if not already logged in)
az account show > /dev/null 2>&1
if [ $? != 0 ]; then
  echo "You are not logged into Azure. Running 'az login'..."
  az login
fi

# 2. Create Resource Group
echo "Creating resource group '$RESOURCE_GROUP' in '$LOCATION'..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --tags project=cloudnotes-learner

# 3. Deploy Bicep Template
echo "Deploying Bicep template... This may take several minutes."
az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file ../bicep/main.bicep \
  --parameters \
    resourceNamePrefix="$RESOURCE_PREFIX" \
    postgresAdminLogin="$POSTGRES_ADMIN_USER" \
    postgresAdminPassword="$POSTGRES_ADMIN_PASSWORD" \
  --name "cloudnotes-deployment"

echo "Deployment complete!"

# 4. Show Outputs
echo "Getting deployment outputs..."
outputs=$(az deployment group show --resource-group "$RESOURCE_GROUP" --name "cloudnotes-deployment" --query "properties.outputs")
echo "--------------------------------------------------"
echo "Deployment Outputs:"
echo $outputs | jq .
echo "--------------------------------------------------"
echo "You can now use these values to configure your application and CI/CD pipeline."
echo "Next steps: Configure secrets in Azure Key Vault and set up GitHub Actions."