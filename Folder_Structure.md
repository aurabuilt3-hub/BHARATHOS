# Folder Structure

# BharatOS - Project Architecture

---

# Overview

BharatOS follows a modular monorepo architecture.

Each major responsibility is isolated into its own directory, allowing frontend, backend, AI, and infrastructure to evolve independently while sharing common documentation and configuration.

---

# Root Structure

```
bharatos/

├── frontend/
├── backend/
├── ai/
├── database/
├── docs/
├── assets/
├── prompts/
├── deployment/
├── scripts/
├── tests/
├── .github/
├── .env.example
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

# Frontend

```
frontend/

├── app/
│
├── components/
│   ├── common/
│   ├── dashboard/
│   ├── maps/
│   ├── charts/
│   ├── ai/
│   ├── incidents/
│   └── ui/
│
├── hooks/
├── services/
├── lib/
├── providers/
├── context/
├── store/
├── utils/
├── types/
├── constants/
├── styles/
├── public/
└── middleware.ts
```

---

# Backend

```
backend/

├── api/
│
├── routes/
│
├── controllers/
│
├── services/
│
├── repositories/
│
├── middleware/
│
├── schemas/
│
├── models/
│
├── config/
│
├── utils/
│
├── websocket/
│
├── workers/
│
├── tests/
│
└── main.py
```

---

# AI

```
ai/

├── coordinator/
├── weather/
├── traffic/
├── emergency/
├── healthcare/
├── citizen/
├── analytics/
├── vision/
├── rag/
├── mcp/
├── prompts/
├── memory/
├── tools/
├── workflows/
├── utils/
└── config/
```

---

# Database

```
database/

├── schema/
├── migrations/
├── seed/
├── functions/
├── triggers/
├── policies/
├── indexes/
└── backups/
```

---

# Documentation

```
docs/

01_Project_Overview.md
02_Problem_Statement.md
03_Features.md
04_Tech_Stack.md
05_System_Architecture.md
06_AI_Agents.md
07_Database_Design.md
08_API_Design.md
09_UI_UX_Design.md
10_User_Flows.md
11_Modules.md
12_Development_Roadmap.md
13_Future_Scope.md
14_AI_Workflow.md
15_Folder_Structure.md
```

---

# Assets

```
assets/

├── logos/
├── icons/
├── illustrations/
├── screenshots/
├── demo/
├── presentations/
├── videos/
└── branding/
```

---

# Prompts

```
prompts/

├── coordinator.md
├── weather.md
├── traffic.md
├── emergency.md
├── healthcare.md
├── citizen.md
├── analytics.md
└── report.md
```

---

# Deployment

```
deployment/

├── vercel/
├── render/
├── docker/
├── nginx/
└── environment/
```

---

# Scripts

```
scripts/

├── seed.py
├── simulate_iot.py
├── generate_reports.py
├── create_demo_data.py
└── reset_database.py
```

---

# Tests

```
tests/

├── frontend/
├── backend/
├── ai/
├── integration/
├── api/
├── security/
└── performance/
```

---

# GitHub Workflows

```
.github/

workflows/

├── frontend.yml
├── backend.yml
├── ai.yml
├── deploy.yml
└── lint.yml
```

---

# Environment Variables

Frontend

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_API_URL

Backend

- GEMINI_API_KEY
- SUPABASE_SERVICE_ROLE_KEY
- DATABASE_URL
- JWT_SECRET
- WEATHER_API_URL

---

# Development Guidelines

- One responsibility per folder.
- Reusable components only.
- Shared utilities in `utils/`.
- API logic in `services/`.
- Keep AI prompts version-controlled.
- Store secrets only in environment variables.
- Write tests for every critical workflow.

---

# Naming Conventions

Files

- kebab-case

React Components

- PascalCase

Functions

- camelCase

Database Tables

- snake_case

API Routes

- kebab-case

---

# Summary

The BharatOS folder structure separates concerns across frontend, backend, AI, database, infrastructure, and documentation. This organization supports collaborative development, simplifies maintenance, and provides a scalable foundation for the SIH prototype and future expansion.