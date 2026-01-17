# Architecture Overview

The Improvement Portal sits in front of a set of off-the-shelf tools. A lightweight backend API orchestrates data and exposes a single UI.

## Components
- **Frontend** (`/frontend`): React + Vite single-page app exposed at `/portal`.
- **Backend** (`/backend`): Express API, integrates with NocoBase, BookStack, Fider, and Ollama.
- **NocoBase**: Primary data store for portal domain collections (submissions, issues, decisions, etc.).
- **Fider**: Voting and community issue tracking.
- **BookStack**: Knowledge base and FAQ sources.
- **OpenProject**: Execution and project tracking.
- **n8n**: Automation workflows.
- **Ollama**: Local LLM summarization.
- **Caddy reverse proxy**: Central ingress for all services.

## Data Flow
1. **Submission intake**: UI -> Backend -> NocoBase `submissions` collection.
2. **Promotion**: Power user promotes a submission -> Backend creates NocoBase `issues` and optionally a Fider post.
3. **FAQ check**: UI -> Backend -> BookStack search; if confident, Ollama summarizes.
4. **Decisions**: Supervisor submits decisions -> Backend enforces authority rules -> NocoBase `decisions`.

## Networking
All services communicate over the internal `portal_net` network. Only Caddy exposes host ports.
