# Development Roadmap

# BharatOS - Project Execution Plan

---

# Overview

This roadmap outlines the development phases for BharatOS, from planning to the Smart India Hackathon (SIH) prototype.

The primary objective is to deliver a stable, polished, and fully demonstrable prototype centered on **Visakhapatnam** while maintaining a regional hierarchical database architecture capable of scaling nationwide.

---

# Team Roles

- **AI Engineer**: LangGraph multi-agent workflow, Gemini 2.5 Pro integrations, RAG/pgvector pipeline, and MCP tools configurations.
- **Frontend Developer**: Next.js 15 page structure, Leaflet maps layer rendering, Recharts panels, and responsive Framer Motion dashboards.
- **Backend Developer**: FastAPI endpoints, JWT auth integration, WebSockets broadcasting, and mock sensor data simulation scripts.
- **Database Engineer**: PostgreSQL schemas, indexes, Supabase migrations, and Row-Level Security (RLS) configurations.
- **UI / UX Designer**: Figma design system, dark-first UI components, mobile interfaces, and officer dashboard widgets layout.
- **QA & Documentation**: Unit tests, integration validation, demo scenarion scripting, and presentation backup assets preparation.

---

# Development Phases

### Phase 1 - Database & Backend Setup (Sprint 1)
- Deploy Supabase database and execute migrations for `states`, `districts`, `cities`, `zones`, `wards`, `users`, `departments`, `officers`, `incidents`, `hospitals`, `ambulances`, `police_stations`, `fire_stations`, and RLS schemas.
- Implement FastAPI authentication (`/auth/login`, `/auth/register`) and basic CRUD endpoints.
- Establish monorepo workspace.

### Phase 2 - Multi-Agent AI Development (Sprint 2)
- Configure LangGraph orchestration and the Coordinator Agent node.
- Write prompts for domain agents (Weather, Traffic, Emergency, Healthcare, Citizen, Analytics) referencing **Gemini 2.5 Pro**.
- Implement pgvector RAG pipeline for NDMA SOP search.
- Implement Gemini Vision classification for the **10 Standardized Categories**.

### Phase 3 - Digital Twin & Maps Integration (Sprint 3)
- Integrate Leaflet map renders in Next.js.
- Plot assets dynamically: Hospitals, Police stations, Fire stations (using updated lat/lon columns), and Sensor location pins.
- Implement Live GPS vehicle tracking using coordinates simulation.

### Phase 4 - Realtime Sync & Telemetry (Sprint 4)
- Configure Supabase Realtime/WebSocket triggers to push data updates (Incident statuses, notifications, sensor logs) to clients.
- Script IoT mock telemetry loops.
- Build the Right Panel context-aware AI recommendation widget.

### Phase 5 - Frontend Pages & UI Polish (Sprint 5)
- Develop Citizen Portal mobile layouts.
- Build Officer, Department Head, and District dashboards.
- Polish animations using Framer Motion and ensure WCAG accessibility rules are met.

### Phase 6 - Validation, Testing & Deployment (Sprint 6)
- Run regression tests (Pytest on backend, Jest/Cypress on frontend).
- Deploy Next.js to Vercel and FastAPI to Render.
- Pre-seed database with Visakhapatnam flood demo scenario data.

---

# Priority Matrix

## High Priority (MVP Core)
- Auth & JWT verification
- Standardized incident reporting flow
- Leaflet map plotting
- Coordinator Agent recommendation generation
- WebSocket state sync
- Human approval controls

## Medium Priority
- Regional Dashboards (District / State views)
- RAG document searches
- Voice transcription (Hindi/Telugu/Bengali APIs)
- Analytics PDF reports generation

## Low Priority (Post-Prototype)
- Drone monitoring simulations
- Live CCTV video stream overlay
- Satellite radar feeds integration

---

# Demonstration Scenario

The recommended SIH demonstration flow:
1. **Open National Dashboard**: Show India map, selecting Andhra Pradesh.
2. **Open District Dashboard**: Select Visakhapatnam District to view aggregated city metrics.
3. **Open Visakhapatnam Digital Twin**: Renders Leaflet map layers. Show active police stations, fire stations, hospitals, and simulated sensors.
4. **Citizen Reports Incident**: Citizen uploads flood/fallen tree photo. AI analyzes and classifies into `Fallen Tree` (Confidence: 94%).
5. **Weather & Traffic Check**: Weather agent outputs high flood risk; Traffic agent maps diversion routes around Beach Road.
6. **AI Dispatch Drafted**: Coordinator outlines dispatch recommendation (Seven Hills Hospital ambulance, Beach Police unit).
7. **Officer Approval**: Department Head reviews explanation and clicks "Approve."
8. **Realtime Map Update**: Ambulance vehicle pin moves on map. Citizen app updates timeline.
9. **Analytics Review**: View charts and download AI-generated operational summary.
