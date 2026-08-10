# Testing Strategy

# BharatOS - Quality Assurance & Validation Plan

---

# Overview

The BharatOS testing strategy ensures that all modules, AI workflows, database constraints, APIs, and UI layers function correctly. The strategy supports a zero-defect, stable, and highly interactive live presentation during the Smart India Hackathon.

---

# QA Test Matrix

```
       [Unit Tests]            [Integration Tests]            [API Tests]
  - Database helper logic     - Frontend ↔ API server       - Auth JWT header checks
  - Lat/Lon geometry parsers  - API server ↔ Supabase       - Incident CRUD payloads
  - Priority enums validation - API server ↔ Gemini API     - Simulation parameters

       [AI Tests]            [Digital Twin Tests]          [Realtime Tests]
  - Citizen Agent triage      - Leaflet map rendering       - WebSocket event delays
  - Coordinator agent routing - Vehicle tracking lat/lon    - Push notification banners
  - Cosine similarity RAG SOPs- Heatmap overlay accuracy    - Multi-client sync checks
```

---

# Detailed Testing Areas

### 1. Database Schema Constraints Validation
- Verify foreign key cascades (e.g. deleting a `district` cascades to its `cities`, but deleting a `department` is restricted if active `officers` are attached).
- Verify constraints on the `incidents.category` enum only accept the **10 Standardized Categories**:
  `Flood`, `Fire`, `Medical`, `Accident`, `Garbage`, `Water Leakage`, `Pothole`, `Street Light Failure`, `Fallen Tree`, `Infrastructure Damage`.
- Verify default values for timestamps (`created_at` and `updated_at`) trigger automatically.

### 2. API Schema Validation (Pydantic / Zod)
- Test invalid payloads return `400 Bad Request` with structured error messages (e.g., missing longitude, empty password strings).
- Verify `Authorization` middleware rejects requests missing the `Bearer` token or containing expired keys with `401 Unauthorized`.
- Test specific APIs for fire stations (`GET /fire-stations`) and police stations return the new coordinate fields correctly.

### 3. AI Orchestration Validation (LangGraph & Gemini)
- **Triage Testing**: Send test images to Citizen Agent (using Gemini Vision) and verify accuracy in category matching.
- **Routing Loop**: Input weather sensors high values to check if the Coordinator runs only the Weather Agent node and bypasses Healthcare/Ambulance calls (saving API token counts).
- **RAG Accuracy**: Query standard SOP definitions and confirm responses match the vector records in `knowledge_base` with confidence scores above 75%.

### 4. Digital Twin Spatial Mapping
- Test dynamic rendering of the Visakhapatnam map and toggle layers (Weather, Traffic).
- Verify markers representing ambulances, police units, and fire stations position accurately based on their `latitude` and `longitude` fields.
- Test Leaflet container behavior on mobile layouts.

### 5. WebSocket Real-Time Broadcasts
- Connect two distinct browser tabs. Trigger an incident update (e.g. `PATCH /incidents/{id}/status`) in Tab 1, and verify Tab 2 reflects the status change and overlays a notification banner within 300ms without page reload.

---

# CI / CD Test Commands

- **Backend Unit Tests (Pytest)**:
  ```bash
  cd backend
  pytest tests/unit/ -v
  ```
- **Backend API Tests (Pytest-asyncio)**:
  ```bash
  pytest tests/api/ -v
  ```
- **Frontend Component Tests (Jest)**:
  ```bash
  cd frontend
  npm run test
  ```
- **End-to-End Workflows (Cypress)**:
  ```bash
  npm run test:e2e
  ```
