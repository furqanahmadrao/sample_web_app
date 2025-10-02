# CloudNotes

A full-stack notes application built for learning Azure cloud services integration.

## Architecture

- **Frontend**: React + Vite SPA
- **Backend**: Node.js + Express REST API
- **Database**: PostgreSQL (Azure Database for PostgreSQL)
- **Storage**: Azure Blob Storage
- **Serverless**: Azure Functions
- **CI/CD**: GitHub Actions
- **Infrastructure**: Bicep

## Quick Start

### Local Development

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Docker Compose** (with PostgreSQL):
   ```bash
   docker-compose up
   ```

### Azure Deployment

See connection guides in `docs/connection-guides/` for step-by-step Azure service integration.

## Features

- User authentication (JWT)
- CRUD notes operations
- File uploads to Azure Blob Storage
- Automatic thumbnail generation via Azure Functions
- Admin analytics endpoints
- Comprehensive monitoring with Application Insights

## Learning Path

Follow the 30-day connection plan to integrate Azure services step by step.