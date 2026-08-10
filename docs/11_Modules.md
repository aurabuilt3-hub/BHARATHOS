# BharatOS Modules

# Functional Module Documentation

---

# Overview

BharatOS is divided into independent, functional modules.

Each module is designed to be scalable, reusable, and loosely coupled with the rest of the platform.

This modular architecture allows developers to build and test features independently while maintaining a unified smart governance command center.

---

# Module Map

```
[Authentication Module]
       │
       ├─► [Citizen Portal]
       ├─► [Officer Dashboard]
       ├─► [Department Head Module]
       ├─► [District / Regional Dashboard]
       └─► [Admin Panel]
              │
              ▼
    [Core Operations Engine]
       │ (Incident Lifecycle, Digital Twin Maps)
       ▼
    [Intelligence Layer]
       │ (AI Multi-Agent, RAG, MCP, IoT Simulation)
       ▼
    [Realtime & Notifications]
```

---

# Module 1 - Authentication & RBAC
- **Purpose**: Manage identity and dashboard routing access control.
- **Features**:
  - Sign in, Sign up, Sign out (Supabase Auth).
  - JWT generation and payload verification.
  - Role validation: Citizen, Officer, Department Head, Administrator, State Admin, National Admin.
  - Row-Level Security policy mapping for DB queries.

---

# Module 2 - Citizen Portal (Mobile Interface)
- **Purpose**: Citizen grievance reporting and hazard logging.
- **Features**:
  - Simplified incident submission form with photo and audio attachments.
  - Interactive map displaying emergency alerts and shelters.
  - Personalized ticket status timeline.
  - In-app notification alerts.

---

# Module 3 - Officer Dashboard
- **Purpose**: Responder field operations and queue management.
- **Features**:
  - Active incident list sorted by priority and category.
  - Leaflet map displaying assigned incidents and active routes.
  - Photo update uploads for incident completion records.

---

# Module 4 - Department Head Module (NEW)
- **Purpose**: Department asset tracking and dispatch sign-off.
- **Features**:
  - Live resource counts dashboard (Hospitals, Police, Fire assets).
  - AI Action Plan authorization tool.
  - Manual dispatch overriding capability.

---

# Module 5 - District Dashboard (NEW)
- **Purpose**: Regional governance summary and aggregated telemetry.
- **Features**:
  - Aggregated city alerts and notifications.
  - District risk heatmaps.
  - AI chat assistant for district level summaries.

---

# Module 6 - Administration Panel
- **Purpose**: Core platform configurations.
- **Features**:
  - User profile management.
  - City, zone, and ward coordinate bounding mapping.
  - System logs audit.

---

# Module 7 - Digital Twin
- **Purpose**: Live spatial visualization of cities.
- **Features**:
  - OpenStreetMap render with Leaflet layers.
  - Live GPS markers tracking.
  - Bounding zones and hazard maps overlays.

---

# Module 8 - Incident Management
- **Purpose**: Tracks incident states from logging to closure.
- **Features**:
  - Support for the **10 Standardized Categories**:
    `Flood`, `Fire`, `Medical`, `Accident`, `Garbage`, `Water Leakage`, `Pothole`, `Street Light Failure`, `Fallen Tree`, `Infrastructure Damage`.
  - Assignment records creation.
  - Timeline status triggers.

---

# Module 9 - AI Engine
- **Purpose**: Runs agent nodes and coordinates decision recommendations.
- **Features**:
  - LangGraph router for Coordinator and domain sub-agents.
  - Gemini 2.5 Pro reasoning call handles.
  - Explainable actions formatting.

---

# Module 10 - Weather Intelligence
- **Purpose**: Meteorological alerts tracking.
- **Features**:
  - Open-Meteo current API ingestion.
  - Flood risk levels computation.

---

# Module 11 - Traffic Intelligence
- **Purpose**: Traffic coordination.
- **Features**:
  - Diversion route calculation.
  - Congestion analytics.

---

# Module 12 - Healthcare Management
- **Purpose**: Medical logistics coordination.
- **Features**:
  - ICU/bed capacity checks.
  - Ambulance coordinates linking.

---

# Module 13 - Emergency Response
- **Purpose**: Dispatching logistics.
- **Features**:
  - Automated resource requirements drafting.
  - Live status tracking.

---

# Module 14 - Analytics & Reports
- **Purpose**: Metric reporting.
- **Features**:
  - Recharts telemetry panels.
  - PDF/Excel summaries generation.

---

# Module 15 - Voice & Vision AI
- **Purpose**: Media inputs processing.
- **Features**:
  - Speech transcription.
  - Gemini Vision image classifications.

---

# Module 16 - RAG & SOP Knowledge Base
- **Purpose**: SOP compliance grounding.
- **Features**:
  - PDF parsing and tokenizing.
  - `pgvector` semantic matching queries.

---

# Module 17 - IoT Simulation
- **Purpose**: Telemetry mock loops.
- **Features**:
  - Mock sensor generators.
  - Realtime WebSocket publishers.

---

# Module 18 - Security & Audit logs
- **Purpose**: System compliance tracking.
- **Features**:
  - User activity logging.
  - Rate limiting logs.
