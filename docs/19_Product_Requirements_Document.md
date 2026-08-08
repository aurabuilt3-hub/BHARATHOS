# Product Requirements Document (PRD)

# BharatOS

Version: 1.0  
Status: Ready  

---

# 1. Executive Summary

BharatOS is an AI-powered Digital Twin command center platform designed to help municipal and disaster management authorities monitor, analyze, predict, and coordinate city operations. The platform consolidates isolated departmental data streams (telemetry, citizens complaints, resources logs) and processes them through a network of specialized AI agents running **Gemini 2.5 Pro** and **LangGraph** to recommend grounded, explainable actions.

---

# 2. Product Vision & Goals

- **Vision**: transition governance from reactive response to proactive hazard prediction using real-time spatial digital twin maps and explainable AI plans.
- **Goals**:
  - Reduce emergency dispatch latency.
  - De-silo municipal communications.
  - Empower citizens with simple multilingual grievance channels.
  - Ground all AI operations in verified SOP manuals.

---

# 3. Core Roles & Navigation

The platform supports role-based UI screens:
1. **Citizen**: Grievance logging, timelines, and alerts.
2. **Officer**: Deployed team interface, task logs, and routing.
3. **Department Head (NEW)**: Resource overview console and AI dispatch approvals.
4. **District Admin (NEW)**: Regional analytics aggregation and cross-city coordination.
5. **State/National Admin**: High-level alerts monitor and configs.

---

# 4. Functional Requirements

### 4.1. Incident Grievance Categories
All incident reporting, database structures, AI classification, and API routers must strictly support the **10 Standardized Categories**:
1. `Flood`
2. `Fire`
3. `Medical`
4. `Accident`
5. `Garbage`
6. `Water Leakage`
7. `Pothole`
8. `Street Light Failure`
9. `Fallen Tree`
10. `Infrastructure Damage`

### 4.2. Incident Lifecycle
- Triage: Citizen logs photo → AI detects category and priority.
- Status states transition: `Pending` → `Assigned` → `In Progress` → `Resolved` → `Closed`.
- History tracking: All state transitions log officer IDs and update times in the database.

### 4.3. Digital Twin Mapping
- Render Visakhapatnam OSM tiles using Leaflet.
- Plot assets: Hospitals, Police stations, Fire stations (with coordinates), and Sensor location pins.
- Plot live emergency vehicle positions.

### 4.4. Multi-Agent AI Engine
- **LangGraph Coordinator Node**: Orchestrates sub-agents (Weather, Traffic, Emergency, Healthcare, Citizen, Analytics).
- **RAG groundings**: Cosine similarity query matches SOP guidelines in `pgvector` database and appends them to LLM context window.
- **Human-in-the-loop**: Critical operations require explicitly clicking "Approve" on the dashboard (saving actions in `audit_logs`).

---

# 5. Non-Functional Requirements

- **Performance**: Dashboard loads in under 3 seconds; API response latency is under 500ms (excluding LLM calls).
- **Security**: JWT tokens via Supabase Auth; RLS policies activated on PostgreSQL tables.
- **Real-Time Sync**: Pushing updates via WebSockets within 300ms of DB commits.
- **Availability**: System runs reliably on mobile layouts (Citizen Portal) and desktops (Command Center).

---

# 6. Assumptions & Scope Boundaries

- The prototype uses Visakhapatnam as the fully mapped city model.
- Sensors and coordinates data streams are simulated on local scripts.
- Drone and live CCTV stream analysis are out of scope for the MVP.
