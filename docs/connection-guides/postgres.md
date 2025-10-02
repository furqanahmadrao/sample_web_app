# Connection Guide: Azure Database for PostgreSQL

This guide will walk you through connecting the CloudNotes backend to a managed PostgreSQL database hosted on Azure.

### Why do we need a managed database?

A managed database service like Azure Database for PostgreSQL handles the tedious work of database administration for you. This includes server setup, patching, backups, and scaling. By using a managed service, you can focus on building your application instead of managing database infrastructure. It provides high availability, security, and performance without the operational overhead.

---

### 1. Provision the Database

Your PostgreSQL server was already provisioned when you ran the `azure/azcli-setup.sh` script. The Bicep template created an "Azure Database for PostgreSQL, Flexible Server" instance. Now, let's connect to it.

### 2. Gather Connection Details

You need the following information to connect your application to the database:
-   **Host**: The fully qualified domain name of your PostgreSQL server.
-   **Database Name**: The name of the database (`cloudnotes`).
-   **Username**: The admin username you configured (`<POSTGRES_ADMIN_USERNAME>`).
-   **Password**: The admin password you provided during setup.

#### Azure Portal Steps:

1.  Navigate to the [Azure Portal](https://portal.azure.com).
2.  Go to the resource group you created.
3.  Find and click on your **Azure Database for PostgreSQL flexible server** resource (e.g., `cloudnotes-psql`).
4.  In the **Overview** pane, you will find the **Server name** (this is your host).

#### Azure CLI Steps:

Run this command to get the details of your PostgreSQL server. Replace `<RESOURCE_GROUP>` and `<SERVER_NAME>` with your values.

```bash
# Get the server's fully qualified domain name (host)
az postgres flexible-server show \
  --resource-group <RESOURCE_GROUP> \
  --name <SERVER_NAME> \
  --query "fullyQualifiedDomainName" \
  --output tsv
```
**Expected Output:**
```
<SERVER_NAME>.postgres.database.azure.com
```

### 3. Configure Firewall Rules

By default, your PostgreSQL server is locked down. You need to add a firewall rule to allow your local machine to connect for testing and migrations.

#### Azure Portal Steps:

1.  In your PostgreSQL server's portal page, go to **Networking** under the "Settings" section.
2.  Click **"Add your current client IP address"**. This will create a firewall rule for your computer.
3.  Click **Save**.

#### Azure CLI Steps:

This command automatically detects your public IP and adds a firewall rule.

```bash
# Get your public IP address
MY_IP=$(curl -s ifconfig.me)

# Create the firewall rule
az postgres flexible-server firewall-rule create \
  --resource-group <RESOURCE_GROUP> \
  --name <SERVER_NAME> \
  --rule-name "AllowMyIP" \
  --start-ip-address "$MY_IP" \
  --end-ip-address "$MY_IP"
```
**Expected Output:**
A JSON object describing the new firewall rule.

### 4. Store the Connection String in Key Vault

To avoid hardcoding secrets, we will store the database connection string in Azure Key Vault. The App Service will then securely retrieve it at runtime.

The connection string format is: `postgresql://<user>:<password>@<host>:<port>/<database>`

#### Azure Portal Steps:

1.  Navigate to your **Key Vault** resource in the Azure portal.
2.  Go to **Secrets** and click **"+ Generate/Import"**.
3.  For the **Name**, enter `DATABASE-URL`.
4.  For the **Value**, paste your connection string. Replace the placeholders with your actual values.
    *Example: `postgresql://demoadmin:your-strong-password@cloudnotes-psql.postgres.database.azure.com:5432/cloudnotes`*
5.  Click **Create**.

#### Azure CLI Steps:

```bash
# Construct the connection string
CONNECTION_STRING="postgresql://<POSTGRES_ADMIN_USERNAME>:<YOUR_PASSWORD>@<YOUR_PG_HOST>:5432/cloudnotes"

# Set the secret in Key Vault
az keyvault secret set \
  --vault-name <KEY_VAULT_NAME> \
  --name "DATABASE-URL" \
  --value "$CONNECTION_STRING"
```

### 5. Test the Connection

You can test the database connection directly from your local machine using `psql`, a command-line utility for PostgreSQL.

1.  **Install `psql`**: If you don't have it, you can install it as part of the [PostgreSQL client tools](https://www.postgresql.org/download/).

2.  **Connect to the database:**
    ```bash
    psql "host=<YOUR_PG_HOST> user=<POSTGRES_ADMIN_USERNAME> dbname=cloudnotes"
    ```
    You will be prompted for your password.

3.  **Run a test query:**
    Once connected, run this command to verify the `users` table exists (it was created by the `init.sql` script during local dev, but you'll need to migrate it for Azure).
    ```sql
    \dt
    ```
    **Expected Output:**
    ```
             List of relations
     Schema | Name  | Type  |   Owner
    --------+-------+-------+-----------
     public | notes | table | demoadmin
     public | users | table | demoadmin
    (2 rows)
    ```
    If the tables are not there, you'll need to run the migration script against the Azure database.

### 6. Common Errors and Fixes

1.  **Error**: `FATAL: password authentication failed for user "<user>"`
    *   **Cause**: The password is incorrect.
    *   **Fix**: Double-check the password you are using. If you forgot it, you can reset it in the Azure portal under your PostgreSQL server's "Reset password" section.

2.  **Error**: `psql: error: could not connect to server: Connection timed out`
    *   **Cause**: A firewall is blocking the connection. Your IP address may have changed, or the rule was not set correctly.
    *   **Fix**: Run the `az postgres flexible-server firewall-rule create` command again to add your current IP address to the allowlist. Also, ensure your App Service has access if you are running into issues from the deployed application.

3.  **Error**: `relation "users" does not exist`
    *   **Cause**: The database schema (tables) has not been created in the Azure database.
    *   **Fix**: You need to run the migration script against your Azure database. You can do this by temporarily configuring your local backend to point to the Azure DB and running `npm run migrate`.
        ```bash
        # In the backend/.env file
        DATABASE_URL="<YOUR_AZURE_DATABASE_URL>"

        # Then run the migration
        npm run migrate
        ```
        **Remember to remove the secret from your `.env` file afterward!**

---

### Cost Control & Cleanup

-   **SKU Choice**: The Bicep template uses a `Standard_B1ms` (Burstable) SKU, which is cost-effective for development and testing.
-   **Stopping the Server**: To save costs, you can stop the PostgreSQL server from the Azure portal when not in use. Go to the server's **Overview** page and click **Stop**.
-   **Deleting**: If you are completely done, delete the entire resource group to avoid any further charges.