# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CloudNotes is a full-stack web application designed for Azure cloud learning. It demonstrates core Azure services integration through a notes application with file upload capabilities.

## Architecture

- **Frontend**: React + Vite SPA
- **Backend**: Node.js + Express REST API with JWT authentication
- **Database**: PostgreSQL (Azure Database for PostgreSQL Flexible Server)
- **Storage**: Azure Blob Storage for file uploads
- **Serverless**: Azure Functions for blob processing
- **Containerization**: Docker for backend
- **CI/CD**: GitHub Actions
- **Infrastructure**: Bicep templates
- **Secrets**: Azure Key Vault with Managed Identities
- **Monitoring**: Application Insights

## Development Commands

### Backend Development

```bash
cd backend
npm install
npm run dev          # Start development server
npm test             # Run tests
npm run lint         # Run linting
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Docker Development

```bash
docker-compose up    # Start local development with PostgreSQL
```

### Infrastructure Deployment

```bash
# Deploy with Bicep
az deployment group create --resource-group <RG> --template-file bicep/main.bicep --parameters @bicep/parameters.json

# Azure CLI setup
bash azure/azcli-setup.sh
```

### Testing

```bash
# Run backend tests
cd backend && npm test

# Run API smoke tests
curl http://localhost:3000/api/health
```

## Key Files Structure

- `backend/` - Express.js API server

  - `src/index.js` - Main server entry point
  - `src/routes/` - API route handlers
  - `src/db.js` - PostgreSQL connection
  - `Dockerfile` - Container configuration
  - `tests/` - Jest tests

- `frontend/` - React application

  - `src/main.jsx` - React entry point
  - `src/pages/` - React components
  - `vite.config.js` - Vite configuration

- `bicep/main.bicep` - Infrastructure as Code
- `azure/azcli-setup.sh` - Azure CLI deployment script
- `github/workflows/` - CI/CD pipelines
- `migrations/001_init.sql` - Database schema
- `docker-compose.yml` - Local development

## Development Patterns

- Use plain `pg` library for database operations (no ORM)
- JWT authentication with bcrypt for password hashing
- Environment variables for configuration
- Key Vault integration for production secrets
- Application Insights for logging and monitoring
- Simple, well-commented code for learning purposes

## Connection Guides Location

Service-specific connection guides are in `docs/connection-guides/`:

- Postgres connection guide
- Blob Storage connection guide
- Key Vault connection guide
- App Service connection guide
- Function App connection guide
- Application Insights guide

Each guide includes Azure Portal steps, az cli commands, and testing procedures.
