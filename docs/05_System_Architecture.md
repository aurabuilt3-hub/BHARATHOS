# System Architecture

# BharatOS - AI Powered Multi-Agent Digital Twin Platform

---

# Overview

BharatOS follows a modular, cloud-native, AI-first architecture that combines a Digital Twin platform, Multi-Agent AI, real-time data processing, and scalable backend services.

The system is designed to support governance at multiple administrative levels, from a single city prototype to nationwide deployment.

---

# High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                     │
│                                                             │
│ Citizen Portal (Mobile) │ Officer / Admin Dashboard (Web)   │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (FastAPI)                    │
└─────────────────────────────────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
   Business Logic          AI Engine          Realtime Engine
  (FastAPI Routes)        (LangGraph)      (Supabase Realtime)
         │                     │                     │
         ▼                     ▼                     ▼
    Data Layer            Multi-Agent            WebSocket
  (PostgreSQL DB)       (Gemini 2.5 Pro)        Broadcasters
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               ▼
                     Digital Twin Dashboard
```

---

# System Components

## Client Layer

Contains all user interfaces.

Applications:
- Citizen Portal (Mobile Web App Interface)
- Officer Dashboard (Detailed administrative Command and Control interface)
- Department Head Dashboard (High-level departmental overview and sign-off interface)
- District / State / National Dashboards (Regional consolidated governance views)
- Administration Panel (User role configuration and settings)

---

## API Layer

Technology: FastAPI

Responsibilities:
- Authentication & Session Verification
- API Route Authorization and Middleware validation
- Input request schemas parsing (Pydantic validation)
- Standardized REST JSON outputs
- WebSocket connection management

---

## Business Layer

Handles platform logic.

Examples:
- Incident Management (Lifecycle state machines)
- User Role Management
- Notification System
- Resource Allocation & Dispatching
- Analytics consolidation
- Report Generation

---

## AI Layer

The intelligence layer of BharatOS.

Built using:
- **Gemini 2.5 Pro** (Primary reasoning model and image triage)
- **LangGraph** (Stateful multi-agent orchestration graph)
- **MCP** (Model Context Protocol linking LLM agents to internal tools)
- **RAG** (Retrieval-Augmented Generation for SOP compliance queries using `pgvector`)

---

## Data Layer

Stores all platform information.

Database: Supabase PostgreSQL
Stores:
- Users & Role configuration
- States, Districts, Cities, Zones, and Wards
- Incidents & image URLs
- Departments & Officer assignments
- Hospitals, Ambulances, Police Stations, and Fire Stations
- Simulated IoT sensor streams
- Notifications & AI/Audit Logs
- SOP documents (Vector embeddings)

---

## Storage Layer

Supabase Storage
Stores:
- Citizen incident images
- AI-generated PDF/Excel operational reports
- Document attachments
- Avatars

---

## Realtime Layer

Powered by: WebSockets via Supabase Realtime
Updates:
- Incident status changes
- Active map marker coordinates (Ambulances / Police cars)
- In-app notification overlays
- Live sensor value graphs
- AI agent recommendations

---

## External Services

- **Open-Meteo**: Weather forecast ingestion
- **OpenStreetMap & Leaflet**: Map rendering tiles
- **Nominatim**: Reverse geocoding

---

# Multi-Agent Architecture

```
                    Citizen Report / Sensor Event
                                 │
                                 ▼
                         Coordinator Agent
                                 │
      ┌──────────────┬───────────┴──┬──────────────┬──────────────┐
      ▼              ▼              ▼              ▼              ▼
Weather Agent  Traffic Agent  Emergency Agent  Healthcare   Analytics Agent
                                                  Agent
      └──────────────┬───────────┬──┴──────────────┬──────────────┘
                     │           │ (MCP / RAG)
                     ▼           ▼
                   Final AI Recommendation
                                 │
                                 ▼
                     Officer Review Panel
                                 │
                            (Approved)
                                 │
                                 ▼
                      WebSocket Update to Map
```

---

# Agent Responsibilities

- **Coordinator Agent**: Receives raw events, assigns tasks to sub-agents, aggregates individual outputs, compiles explainable recommendations, and manages the LangGraph workflow state.
- **Citizen Agent**: Analyzes citizen input (transcribing voice files and triaging images via Gemini Vision) to classify incidents into the 10 standardized categories:
  `Flood`, `Fire`, `Medical`, `Accident`, `Garbage`, `Water Leakage`, `Pothole`, `Street Light Failure`, `Fallen Tree`, `Infrastructure Damage`.
- **Weather Agent**: Ingests weather API coordinates and sensor data to estimate flood risk.
- **Traffic Agent**: Monitages traffic density, maps routing alternatives, and designs diversions.
- **Emergency Agent**: Evaluates safety risks and plans the dispatching parameters (Police units / Fire brigades).
- **Healthcare Agent**: Identifies nearby hospitals, beds, and dispatchable ambulances.
- **Analytics Agent**: Processes historical statistics to render trends and generate reports.

---

# Regional Hierarchy Routing

The architecture supports nested routing:

```
National Command Center (India)
    ↓
State Dashboards (e.g. Andhra Pradesh)
    ↓
District Dashboards (e.g. Visakhapatnam District)
    ↓
City Digital Twins (e.g. Visakhapatnam City)
    ↓
Zone Dashboards (e.g. Zone 1)
    ↓
Ward Views (e.g. Ward 12)
```

Each level aggregates data from lower nodes, providing summaries for administrators at higher tiers.

---

# AI Safety: Human-in-the-Loop

BharatOS does not execute automated critical outcomes. All AI-generated dispatches, alerts, and road closures require review, adjustment, and sign-off by authorized human operators through their dashboard controls before they are registered as active operations.

---

# Summary

BharatOS combines a layered system architecture, multi-agent AI, real-time communication, Digital Twin visualization, and cloud-native infrastructure into a unified platform for intelligent governance. The modular design enables the system to evolve from a single-city prototype into a scalable national platform while maintaining flexibility, maintainability, and high performance.
