# BharatOS — Frontend Integration Contract (Phase 14C)

Welcome to the **BharatOS Frontend Integration Specification**. This document serves as the single source of truth for the frontend development team to connect with the backend APIs, WebSocket channels, and AI Orchestrator.

---

## 1. Base URL & Core Configuration

- **REST API Base URL**: `http://localhost:8000/api/v1`
- **WebSocket Base URLs**:
  - Direct Path: `ws://localhost:8000/ws`
  - Versioned Path: `ws://localhost:8000/api/v1/ws`

*Note: Due to route registration in `app/main.py` and `app/api/v1/router.py`, the WebSocket endpoints are accessible under both prefixes. The direct `/ws/...` path is the recommended primary channel.*

---

## 2. Authentication Requirements

All protected endpoints require a Supabase JWT token.
- **REST**: Pass via the standard `Authorization` header:
  ```http
  Authorization: Bearer <Supabase_JWT_Token>
  ```
- **WebSockets**: Pass via the URL query parameters:
  ```http
  ws://localhost:8000/ws/dashboard?token=<Supabase_JWT_Token>
  ```

### Authentication Table

| Endpoint | Authentication | Required Roles |
| :--- | :--- | :--- |
| `POST /auth/sync-profile` | Required | Any (defaults to `citizen`) |
| `GET /auth/me` | Required | Any |
| `GET /dashboard/overview` | Required | Any |
| `GET /incidents` | Optional | Scoped to User city/district/state if token present |
| `GET /incidents/{id}` | Optional | Scoped to User city/district/state if token present |
| `POST /incidents` | Required | `dept_head`, `state_admin`, `admin`, `national_admin` |
| `PATCH /incidents/{id}/status` | Required | `dept_head`, `state_admin`, `admin`, `national_admin` |
| `POST /incidents/{id}/assign` | Required | `dept_head`, `state_admin`, `admin`, `national_admin` |
| `GET /resources` | Required | Scoped to User city/district/state |
| `GET /facilities` | Required | Scoped to User city/district/state |
| `GET /alerts` | Required | Scoped to User city/district/state |
| `GET /alerts/summary` | Required | Scoped to User city/district/state |
| `GET /digital-twin/nodes` | Required | Scoped to User city/district/state |
| `GET /digital-twin/summary` | Required | Scoped to User city/district/state |
| `POST /ai/chat` | Required | Scoped to User city/district/state |
| `POST /ai/triage` | Optional | Public/Unscoped |
| `GET /admin/data-ingestion/status` | Required | `admin`, `national_admin` |
| `POST /admin/data-ingestion/sync` | Required | `admin`, `national_admin` |

---

## 3. Standard Response Formats

### 3.1. Paginated REST Responses
GET list endpoints (e.g., resources, facilities, alerts) use consistent pagination.
```json
{
  "items": [],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

### 3.2. Standard Error Response
API errors do not leak internal SQL/PostgreSQL stack traces. They return a structured validation or application error schema:
- **Application Errors (401, 403, 404, 409, 500)**:
  ```json
  {
    "detail": "Detailed descriptive error message explaining what failed."
  }
  ```
- **Validation Errors (422 Unprocessable Content)**:
  ```json
  {
    "detail": [
      {
        "loc": ["body", "message"],
        "msg": "field required",
        "type": "value_error.missing"
      }
    ]
  }
  ```

---

## 4. Geographic Scope & RBAC Rules

Geographic boundaries and roles are managed authoritatively by the backend user session. Frontend query parameter overrides (e.g. attempting `?city_id=<other-city>`) will be rejected with `403 Forbidden` if they exceed the user's session scope.

### Scope Hierarchy:
- **`national_admin` / `admin`**: Full access to all states, districts, and cities.
- **`state_admin`**: Restricted to their registered `state_id`.
- **`dept_head` / `officer`**: Restricted to their registered `city_id`.
- **`citizen`**: No administrative or write capability. Can read public announcements.

---

## 5. Provenance & Freshness (Real Vizag Data Contract)

Ingested facilities and telemetry contain real provenance fields indicating data sources:
- **`source_type`**: `OFFICIAL_PUBLIC` | `OPEN_DATA` | `VERIFIED_PUBLIC` | `SIMULATED`
- **`source_name`**: e.g., `"OpenStreetMap / Overpass API"`, `"Open-Meteo"`
- **`source_url`**: Clickable external link to source record.
- **`observed_at`**: ISO timestamp when the metric was originally captured.
- **`freshness`**: `FRESH` (within 1 hour) | `STALE` (within 4 hours) | `EXPIRED` (above 4 hours)

*Note: Simulated records (e.g., test alerts/incidents/sensor gauges) are strictly categorized as `SIMULATED` to differentiate them from genuine Municipal/OSM records.*

---

## 6. Dashboard Overview Field Map (`GET /dashboard/overview`)

The primary endpoint for populating the operational command dashboard.

| Dashboard KPI Component | Exact Response Field Path | Description |
| :--- | :--- | :--- |
| **Active Incidents** | `active_incidents_count` | Sum of incidents with status in `active`, `assigned`, `in_progress` |
| **Total Incidents** | `total_incidents_count` | Sum of all incidents inside the user's geographic scope |
| **Active Alerts** | `active_alerts_count` | Sum of alerts with status in `active`, `acknowledged` |
| **Total Resources** | `resources.total` | Total response units registered in scope |
| **Available Resources** | `resources.available` | Resources in scope with status = `"available"` |
| **Allocated Resources** | `resources.allocated` | Resources in scope with status = `"allocated"` |
| **Facilities Count** | `facilities_count` | Total emergency stations/hospitals in scope |
| **Digital Twin Nodes** | `digital_twin_nodes_count` | Total telemetry and weather nodes registered |
| **Telemetry Count** | `telemetry.total_records` | Total records logged for nodes in scope |
| **Weather Temp** | `weather.temperature` | Current temperature in °C |
| **Weather Humidity** | `weather.humidity` | Relative humidity in % |
| **Weather Wind** | `weather.wind_speed` | Wind speed in km/h |
| **Weather Precipitation**| `weather.precipitation` | Precipitation in mm |
| **Weather Time** | `weather.observed_at` | Observed timestamp (ISO) |
| **Weather Freshness** | `weather.freshness` | Classification: `"FRESH"`, `"STALE"`, `"EXPIRED"` |
| **Weather Source** | `weather.source_name` | Source identification: `"Open-Meteo"` |
| **Air Quality Index** | `air_quality.aqi` | Current US Air Quality Index (AQI) metric |
| **Air Quality PM2.5** | `air_quality.pm2_5` | PM2.5 reading in µg/m³ |
| **Air Quality PM10** | `air_quality.pm10` | PM10 reading in µg/m³ |
| **Air Quality NO2** | `air_quality.nitrogen_dioxide`| Nitrogen dioxide concentration (if available) |
| **Air Quality O3** | `air_quality.ozone` | Ozone concentration (if available) |
| **AQI Freshness** | `air_quality.freshness` | Classification: `"FRESH"`, `"STALE"`, `"EXPIRED"` |

---

## 7. secure Real-Time WebSockets

Frontend connections establish a single WebSocket connection per operational view.
- **Incidents Sub**: `ws://localhost:8000/ws/incidents?token=<JWT>`
- **Telemetry Sub**: `ws://localhost:8000/ws/sensors?token=<JWT>`
- **Alerts Sub**: `ws://localhost:8000/ws/notifications?token=<JWT>`
- **Dashboard Summary Sub**: `ws://localhost:8000/ws/dashboard?token=<JWT>`

### 7.1. Keep-Alive Handshake
Clients must emit a regular `"ping"` string text message to keep connections from timing out. The server responds immediately with `"pong"`.

### 7.2. Event Payload Schema
All events broadcast over WebSockets follow this standard Pydantic envelope:
```json
{
  "event": "INCIDENT_CREATED",
  "timestamp": "2026-08-11T12:00:05.123456",
  "entity_type": "incident",
  "entity_id": "f83ac10b-58cc-4372-a567-0e02b2c3d490",
  "source_type": "SYSTEM",
  "geography": {
    "state_id": "a47ac10b-58cc-4372-a567-0e02b2c3d481",
    "district_id": "b47ac10b-58cc-4372-a567-0e02b2c3d481",
    "city_id": "c47ac10b-58cc-4372-a567-0e02b2c3d481",
    "zone_id": "d47ac10b-58cc-4372-a567-0e02b2c3d481",
    "ward_id": null
  },
  "data": {
    "id": "f83ac10b-58cc-4372-a567-0e02b2c3d490",
    "ticket_number": "INC-2026-000001",
    "category": "Flood",
    "title": "Beach Road Waterlogging",
    "description": "Heavy water accumulation blocking lanes.",
    "latitude": 17.6868,
    "longitude": 83.2185,
    "severity": "high",
    "status": "active",
    "created_at": "2026-08-11T12:00:05.123456"
  }
}
```

### 7.3. WebSocket Supported Event Types
- **`INCIDENT_CREATED`**: Broadcasts when a new incident is reported.
- **`INCIDENT_STATUS_CHANGED`**: Emitted when an incident moves from `active` -> `assigned` | `in_progress` | `resolved`.
- **`INCIDENT_ASSIGNED`**: Emitted when assigned to a specific department.
- **`RESOURCE_ALLOCATED`**: Broadcasts when ambulance, fire, or police unit is assigned to an incident.
- **`RESOURCE_RELEASED`**: Emitted when a resource is freed up.
- **`RESOURCE_UPDATED`**: Emitted when coordinates or status changes.
- **`ALERT_CREATED`**: Sent when sensor rules trigger warnings.
- **`ALERT_STATUS_CHANGED`**: Emitted on `acknowledged` or `resolved`.
- **`TELEMETRY_UPDATED`**: High-frequency metric updates from physical twin nodes.
- **`DIGITAL_TWIN_NODE_UPDATED`**: Sensor health/offline status updates.

---

## 8. AI Contracts

### 8.1. AI Ops Assistant (`POST /ai/chat`)
Engages the multi-agent coordinator for querying infrastructure metrics, incident analysis, or operations.
- **Request**:
  ```json
  {
    "message": "What is the available ICU bed capacity in Visakhapatnam hospitals?",
    "history": []
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "answer": "Based on the latest OpenStreetMap facility records, the active emergency hospitals are:...",
    "intent": "FACILITY_QUERY",
    "confidence": 0.95,
    "sources": ["OSM Nodes: hospital_vizag_1, hospital_vizag_2"],
    "data": { "capacity_metrics": "..." },
    "recommendations": ["Ensure resources are allocated to nearby coordinates."],
    "warnings": []
  }
  ```

### 8.2. AI Triage (`POST /ai/triage`)
Parses raw reports into structured municipal fields.
- **Request**:
  ```json
  {
    "incident_description": "Heavy water accumulation and flood blocking Beach Road Sector 4."
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "summary": "Waterlogging blocking Beach Road Sector 4",
    "confidence": 0.88,
    "reasoning": "Keywords indicate heavy water accumulation and blockage.",
    "evidence": "Water depth blocking access roads",
    "recommended_departments": ["Disaster Management Department"],
    "priority": "high",
    "next_steps": ["Deploy storm pumps", "Coordinate with traffic police"],
    "human_approval_required": true,
    "status": "pending"
  }
  ```
