# CloudNotes: A Hands-On Azure Learning Project

Welcome to **CloudNotes**, a complete, production-style sample application designed to help you learn and practice core Azure cloud concepts. This project provides a full-stack application with a React frontend, a Node.js backend, and all the necessary infrastructure-as-code, CI/CD, and documentation to get you started on your Azure journey.

The primary goal of CloudNotes is not just to provide code, but to offer a structured, hands-on learning path. You will learn by connecting the application components to live Azure services, following our detailed connection guides.

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Local Development Setup](#local-development-setup)
- [Azure Deployment](#azure-deployment)
- [Learning Path: 30-Day Connection Plan](#learning-path-30-day-connection-plan)
- [Security Checklist](#security-checklist)
- [Cost Control](#cost-control)

## Architecture

CloudNotes is built with a modern, scalable architecture that mirrors what you'd find in a real-world cloud-native application.

- **Frontend**: React + Vite (Single-Page Application)
- **Backend**: Node.js + Express (REST API with JWT authentication)
- **Database**: PostgreSQL (designed for Azure Database for PostgreSQL - Flexible Server)
- **File Storage**: Azure Blob Storage (for note attachments)
- **Serverless**: Azure Functions (for processing blob uploads, e.g., thumbnail generation)
- **Containerization**: Docker (for the backend application)
- **CI/CD**: GitHub Actions (for automated testing and deployment)
- **Infrastructure-as-Code (IaC)**: Bicep
- **Secrets Management**: Azure Key Vault with Managed Identities
- **Monitoring**: Application Insights

![Architecture Diagram](docs/architecture.png) <!-- Placeholder for diagram -->

## Features

- **User Authentication**: Secure user signup and login using email/password and JWTs.
- **Notes Management**: Full CRUD (Create, Read, Update, Delete) operations for notes, tied to individual users.
- **Search & Filter**: Search notes by content/title, filter by tags, pinned status, or archived status.
- **Tags System**: Categorize notes with multiple tags for better organization.
- **Pin/Favorite Notes**: Mark important notes to keep them at the top of your list.
- **Archive Notes**: Soft-delete notes by archiving them instead of permanent deletion.
- **File Uploads**: Attach files to notes, which are securely stored in Azure Blob Storage.
- **Serverless Processing**: An Azure Function automatically triggers on file upload to perform background tasks.
- **Admin Analytics**: Enhanced admin endpoint with statistics on notes, tags, archived items, and more.

## Local Development Setup

You can run the entire application stack locally using Docker Compose for a one-command setup.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

### Running with Docker Compose (Recommended)

This is the easiest way to get started. It will spin up the backend server and a PostgreSQL database.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/CloudNotes.git
    cd CloudNotes
    ```

2.  **Start the services:**
    ```bash
    docker-compose up --build
    ```

    - The backend API will be available at `http://localhost:3000`.
    - The PostgreSQL database will be available at `localhost:5432`.

3.  **Run the frontend separately:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    - The frontend application will be running at `http://localhost:3001`.

### Manual Local Setup

If you prefer to run the services manually:

1.  **Start the database:**
    You can use the Docker Compose command to start only the database:
    ```bash
    docker-compose up -d db
    ```

2.  **Run the backend:**
    ```bash
    cd backend
    npm install
    cp .env.example .env # Create a .env file and configure it
    npm run dev
    ```

3.  **Run the frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## Azure Deployment

Deploying CloudNotes to Azure involves two main steps: provisioning the infrastructure and deploying the application code.

### 1. Provision Azure Resources

We use Bicep to define our infrastructure as code. The `azure/azcli-setup.sh` script provides a guided way to deploy all the necessary resources.

1.  **Log in to Azure:**
    ```bash
    az login
    ```

2.  **Configure and run the setup script:**
    - Open `azure/azcli-setup.sh` and fill in the placeholder values at the top of the file.
    - Run the script:
      ```bash
      bash azure/azcli-setup.sh
      ```
    This script will create a resource group and deploy all the services defined in `bicep/main.bicep`. It will output the names of your created resources.

### 2. Configure Secrets in Key Vault

For the application to connect to the database and storage, you must store secrets securely in Azure Key Vault. Refer to the `docs/connection-guides/key-vault.md` guide for detailed steps.

### 3. Set up CI/CD with GitHub Actions

The repository includes GitHub Actions workflows for CI/CD.

-   **CI (`.github/workflows/ci.yml`):** Automatically runs tests on every push to `main`.
-   **CD (`.github/workflows/cd-deploy.yml`):** A manually triggered workflow to build and deploy the backend container to App Service. To use it, you'll need to set up GitHub secrets (`AZURE_CREDENTIALS`, `ACR_USERNAME`, `ACR_PASSWORD`).

## Learning Path: 30-Day Connection Plan

The core of this project is the hands-on learning path. Follow the connection guides in the `docs/connection-guides` directory to connect the application to Azure services, one at a time.

| Day | Task                                         | Validation                                    |
| --- | -------------------------------------------- | --------------------------------------------- |
| 1-3 | **Setup**: Local Dev & Azure Account         | `docker-compose up` runs successfully.        |
| 4-6 | **Provision**: Run Bicep script              | Resources are visible in the Azure portal.    |
| 7-9 | **Connect**: PostgreSQL Database             | Backend can read/write data from Azure DB.    |
| 10-12| **Connect**: Azure Blob Storage              | File uploads from the app appear in storage.  |
| ... | ...                                          | ...                                           |

## Security Checklist

-   [ ] **No Secrets in Code**: Ensure no passwords or connection strings are hardcoded. Use environment variables locally and Key Vault in Azure.
-   [ ] **Managed Identities**: The Bicep template configures Managed Identities for the App Service and Function App. Use them to access other Azure resources securely.
-   [ ] **Key Vault Access Policies**: Configure Key Vault access policies to grant the minimum required permissions to your services.
-   [ ] **CORS**: Configure CORS policies on your storage accounts and App Service to only allow requests from your frontend's domain.

## Cost Control

This project uses services that have free tiers or are low-cost, but it's essential to manage your resources to avoid unexpected bills.

-   **Choose Low-Cost SKUs**: The Bicep templates are configured to use basic, low-cost SKUs (e.g., `B1` for App Service).
-   **Set Budgets**: Create a budget in the Azure portal for your resource group to get alerted when costs approach a certain threshold.
-   **Clean Up**: When you are finished with the project, you can delete the entire resource group to remove all associated resources and stop incurring costs.
    ```bash
    az group delete --name <YOUR_RESOURCE_GROUP_NAME> --yes --no-wait
    ```

Happy learning!