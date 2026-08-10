# Folder Structure

# BharatOS - Project Architecture

---

# Overview

BharatOS follows a modular monorepo architecture.

Each major responsibility is isolated into its own directory, allowing frontend, backend, AI, and database modules to be developed, tested, and deployed independently.

---

# Repository Layout

```
bharatos/
├── frontend/         # Next.js 15 Client Web Application
├── backend/          # FastAPI Backend API Service
├── ai/               # LangGraph Agent Engine & RAG Codebase
├── database/         # PostgreSQL schema migrations and seeds
├── docs/             # Numerical prefixed Markdown documentation
├── prompts/          # Version-controlled AI prompts
├── assets/           # Media and SIH presentation materials
├── deployment/       # Docker, Nginx, and cloud platform configs
├── scripts/          # Database seeding and IoT simulation scripts
└── tests/            # Test suites (unit, integration, api, performance)
```

---

# Folder Details

### `docs/`
Contains all the system design specifications and developer guides. Files are prefixed numerically to establish reading order:
- `01_Project_Overview.md`
- `02_Problem_Statement.md`
- `03_Features.md`
- `04_Tech_Stack.md`
- `05_System_Architecture.md`
- `06_AI_Agents.md`
- `07_Database_Design.md`
- `08_API_Design.md`
- `09_UI_UX_Design.md`
- `10_User_Flows.md`
- `11_Modules.md`
- `12_Development_Roadmap.md`
- `13_Future_Scope.md`
- `14_AI_Workflow.md`
- `15_Folder_Structure.md`
- `16_Frontend_Architecture.md`
- `17_Deployment_Guide.md`
- `18_Testing_Strategy.md`
- `19_Product_Requirements_Document.md`
- `20_SIH_Presentation_Guide.md`
- `21_SIH_Problem_Mapping.md`

### `prompts/`
Stores markdown files containing system prompts and model instructions for all LangGraph agents. Keeping prompts separated from application code allows them to be updated, version-controlled, and optimized easily:
- `coordinator.md`
- `weather.md`
- `traffic.md`
- `emergency.md`
- `healthcare.md`
- `citizen.md`
- `analytics.md`
- `report.md`

### `deployment/`
Config files for deploying the platform:
- `docker/`: Dockerfiles for local containerization.
- `nginx/`: Reverse proxy rules for mapping frontend and backend routes.
- `vercel/`: Build parameters for the Next.js frontend.
- `render/`: Configuration scripts for the FastAPI backend environment.

### `frontend/`
- `app/`: Next.js App Router folders (pages, layouts).
- `components/`: UI components (Leaflet maps, charts, dashboard cards).
- `store/`: Zustand state hooks (user, auth, layers).
- `services/`: Fetch layers querying FastAPI.

### `backend/`
- `api/`: Endpoint definitions (REST, WebSockets).
- `models/`: Pydantic input schemas and DB schemas.
- `services/`: SQL transactions and Business logic.

### `ai/`
- `coordinator/`: LangGraph orchestrator node.
- `weather/`, `traffic/`, etc.: Agent prompt compilers.
- `rag/`: PDF text parser and `pgvector` indexing script.

### `database/`
- `schema/`: DDL SQL scripts defining tables and constraints.
- `migrations/`: SQL migration files.
- `seed/`: Initial seed data for Visakhapatnam.

---

# Naming Conventions

- **Folders/Files**: `kebab-case` (e.g., `digital-twin-map.tsx`)
- **React Components**: `PascalCase` (e.g., `IncidentCard.tsx`)
- **Functions/Variables**: `camelCase` (e.g., `fetchActiveIncidents()`)
- **Database Tables/Columns**: `snake_case` (e.g., `incident_assignments`)
- **API Paths**: `kebab-case` (e.g., `/api/v1/fire-stations`)
