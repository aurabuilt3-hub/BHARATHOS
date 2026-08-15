# BharatOS — Frontend Handoff Checklist (Phase 14C)

This handoff checklist provides the frontend developer with a practical step-by-step path to integrate their Next.js components with the stable FastAPI backend.

---

## 1. Local Environment Setup

### 1.1. Start the Backend
1. Open a terminal in the `backend/` directory.
2. Ensure dependencies are installed: `pip install -r requirements.txt` (or appropriate virtual environment).
3. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
4. Confirm server is running by hitting `http://localhost:8000/api/v1/health` in a browser.

### 1.2. Base URLs
- **REST API URL**: `http://localhost:8000/api/v1`
- **WebSockets URL**: `ws://localhost:8000/ws`

---

## 2. Authentication Flow

- Log in using Supabase Client on the frontend.
- Retrieve the Supabase access token (JWT).
- On login success, hit the profile sync endpoint to register/retrieve permissions:
  - `POST http://localhost:8000/api/v1/auth/sync-profile`
  - Headers: `Authorization: Bearer <Supabase_JWT>`
- Store user roles and permissions in a client-side state store (e.g. Zustand) to control UI visibility.
- Include the token in all subsequent REST requests (`Authorization: Bearer <JWT>`) and WebSocket connections (`?token=<JWT>`).

---

## 3. Map Data Sources & Markers

The dashboard map utilizes dynamic Leaflet overlays. Differentiate data categories using the following classifications:

### 3.1. Facility Markers (Real Municipal Data)
- **Source**: `GET /api/v1/facilities`
- **Data classification**: `OPEN_DATA` (from OpenStreetMap / Overpass API).
- **Categories**: `HOSPITAL` | `POLICE_STATION` | `FIRE_STATION`
- **UI Treatment**: Render using standard category icons. Display a blue **`[OSM]`** or **`[OPEN DATA]`** provenance badge in tooltips with the corresponding `source_url`.

### 3.2. Incident Markers (Citizen & Agent Reports)
- **Source**: `GET /api/v1/incidents` and `ws://localhost:8000/ws/incidents`
- **Data classification**: `VERIFIED_PUBLIC` (official reports) | `SIMULATED` (for simulation/demo).
- **UI Treatment**: Use severity-colored markers (Critical: Red, High: Orange, Medium: Yellow, Low: Green). Include details like ticket number, category, description, and status.

### 3.3. Resource Markers (Response Fleet)
- **Source**: `GET /api/v1/resources` and `ws://localhost:8000/ws/dashboard`
- **Data classification**: `SIMULATED` (fleet tracking).
- **UI Treatment**: Vehicle icons corresponding to `type` (`police_vehicle`, `fire_truck`, `ambulance`, `rescue_team`). Animate status shifts (`available`, `allocated`, `busy`).

### 3.4. Digital Twin Node Markers (Sensor Network)
- **Source**: `GET /api/v1/digital-twin/nodes` and `ws://localhost:8000/ws/sensors`
- **Data classification**: `SIMULATED` (IoT gauge simulation).
- **UI Treatment**: Render gauge status (Operational: Blue/Green, Warning: Orange, Critical: Red). Tooltips should display the metric (`water_level`) and a **`[SIMULATED]`** provenance badge.

---

## 4. Operational Widgets

### 4.1. Weather Widget
- **Source**: `GET /api/v1/dashboard/overview` -> `weather`
- **Data classification**: `OPEN_DATA` (Open-Meteo).
- **Required Display Fields**:
  - Temperature: `weather.temperature` (°C)
  - Humidity: `weather.humidity` (%)
  - Wind Speed: `weather.wind_speed` (km/h)
  - Precipitation: `weather.precipitation` (mm)
  - Weather Code: `weather.weather_code` (WMO weather code representation)
  - Badge: Display a green **`[Freshness: FRESH]`** or corresponding stale indicator based on the calculated `weather.freshness` field.

### 4.2. AQI Widget
- **Source**: `GET /api/v1/dashboard/overview` -> `air_quality`
- **Data classification**: `OPEN_DATA` (Open-Meteo).
- **Required Display Fields**:
  - Air Quality Index: `air_quality.aqi` (US AQI metric)
  - Particulate Matter: `air_quality.pm2_5` and `air_quality.pm10` (µg/m³)
  - Badge: Display the `air_quality.freshness` classification state.

### 4.3. Incident Feed & Action Queue
- **Source**: `GET /api/v1/incidents` and `ws://localhost:8000/ws/incidents`
- **Actions (Operators Only)**:
  - Transition Status: `PATCH /incidents/{id}/status`
  - Assign Department: `POST /incidents/{id}/assign`
  - Allocate Resource: `POST /incidents/{id}/resources`
  - Release Resource: `PATCH /incidents/{id}/resources/{resource_id}/release`

### 4.4. System Alerts Sidebar
- **Source**: `GET /api/v1/alerts/` and `ws://localhost:8000/ws/notifications`
- **Actions**:
  - Acknowledge alert: `PATCH /alerts/{id}/acknowledge`
  - Resolve alert: `PATCH /alerts/{id}/resolve`

---

## 5. Real-Time Events (Zustand Socket Store)

Frontend components must subscribe to WebSocket messages. When active, fallback REST polling must be paused.

1. **Handshake Ping**: Ensure client socket writes `"ping"` every 15 seconds; catch error to trigger reconnection.
2. **Reconnection**: Attempt reconnection using exponential backoff up to 10 seconds. On successful reconnect, trigger a REST refresh to catch any missed updates.
3. **Dispatch Events**:
   - `INCIDENT_CREATED` / `INCIDENT_STATUS_CHANGED` -> Append/update incident lists and map markers.
   - `RESOURCE_ALLOCATED` / `RESOURCE_RELEASED` -> Transition resource statuses in the widget.
   - `TELEMETRY_UPDATED` -> Push updated floats straight to sparklines or gauge tooltips.
   - `ALERT_CREATED` -> Push a system toast/notification banner.

---

## 6. UI States

### 6.1. Loading States
- Display skeleton screens for mapping lists, analytics charts, and resource count cards while fetching REST aggregates.

### 6.2. Empty States
- If `total_incidents_count` is 0, display a clean "No Active Incidents in Your Area" placeholder graphic.
- If `/alerts/` items list is empty, display a "System Operational: No Active Warnings" banner.

### 6.3. Error Boundaries
- Display a fallback "Municipal Service Temporarily Unavailable" notice if REST responses return 500 or connections fail.

---

## 7. AI Copilot Assistant

- **Route**: `POST /api/v1/ai/chat`
- **Headers**: `Authorization: Bearer <Supabase_JWT>`
- **Chat Box Treatment**:
  - Render responses sequentially.
  - Highlight key intent categories (`intent` field e.g., `"FACILITY_QUERY"`, `"RESOURCE_ALLOCATION"`).
  - List sources, recommendations, and warnings in helper badges below the assistant response.
