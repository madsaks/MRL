# Improvement Portal Setup

## Prerequisites
- Podman + podman-compose installed (rootless).
- Node.js only if you want to run frontend/backend locally instead of containers.

## Quick Start (Podman)
```bash
cp .env.example .env
podman-compose -f infra/podman-compose.yml up -d --build
```

## Stop
```bash
podman-compose -f infra/podman-compose.yml down
```

## URLs
- Portal UI: `http://localhost:8080/portal`
- Backend API: `http://localhost:8080/api/health`
- NocoBase: `http://localhost:8080/nocobase`
- Fider: `http://localhost:8080/fider`
- BookStack: `http://localhost:8080/bookstack`
- OpenProject: `http://localhost:8080/openproject`
- n8n: `http://localhost:8080/n8n`
- Ollama: `http://localhost:8080/ollama`

## Environment Variables
All required variables are defined in `.env.example`. Copy and adjust as needed.

## Seeding NocoBase Collections
Build and run the backend container first, then execute the seed script:
```bash
podman-compose -f infra/podman-compose.yml run --rm backend npm run seed
```
If NocoBase API authentication is not configured, create the collections manually in NocoBase using the names listed in the seed script.

## Sanity Checks
```bash
curl -s http://localhost:8080/api/health
curl -s http://localhost:8080/portal/ | head -n 5
```
