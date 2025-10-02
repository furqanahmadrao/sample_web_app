param location string = resourceGroup().location
param environmentName string = 'dev'
param adminUsername string
@secure()
param adminPassword string

var resourcePrefix = 'cloudnotes-${environmentName}'
var postgresServerName = '${resourcePrefix}-psql'
var storageAccountName = '${replace(resourcePrefix, '-', '')}storage'
var keyVaultName = '${resourcePrefix}-kv'
var appServicePlanName = '${resourcePrefix}-asp'
var appServiceName = '${resourcePrefix}-app'
var functionAppName = '${resourcePrefix}-func'
var appInsightsName = '${resourcePrefix}-ai'
var acrName = '${replace(resourcePrefix, '-', '')}acr'

// PostgreSQL Flexible Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-06-01-preview' = {
  name: postgresServerName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: adminUsername
    administratorLoginPassword: adminPassword
    version: '15'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
    }
    availabilityZone: '1'
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

// Storage Account for file uploads
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

// Blob containers
resource uploadsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${storageAccount.name}/default/uploads'
  properties: {
    publicAccess: 'None'
  }
}

resource thumbnailsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${storageAccount.name}/default/thumbnails'
  properties: {
    publicAccess: 'None'
  }
}

// Key Vault for secrets
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    accessPolicies: []
  }
}

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
    size: 'B1'
    family: 'B'
    capacity: 1
  }
  properties: {
    reserved: false
  }
}

// App Service (Web App)
resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: appServiceName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|nginx:alpine'
      appSettings: [
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'true'
        }
      ]
    }
    httpsOnly: true
  }
}

// Function App
resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|mcr.microsoft.com/azure-functions/python:4-python3.9'
    }
    httpsOnly: true
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Flow_Type: 'Bluefield'
    Request_Source: 'rest'
  }
}

// Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// Outputs
output postgresHost string = postgresServer.properties.fullyQualifiedDomainName
output storageAccountName string = storageAccount.name
output keyVaultName string = keyVault.name
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output acrLoginServer string = containerRegistry.properties.loginServer