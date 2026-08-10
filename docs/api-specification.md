# BharatOS API Gateway Specification

This document details the REST API endpoints and WebSockets channels exposed by the **BharatOS** FastAPI backend.

---

## 1. REST API Base Configuration

- **API Base URL**: `http://localhost:8000/api/v1`
- **WS Base URL**: `ws://localhost:8000/ws`
- **Response Format**: `application/json`

---

## 2. API Endpoint Catalog

### 2.1. Authentication & Profiling

#### `POST /users/profile`
- **Description**: Syncs a user profile from the Supabase client sign-up trigger into the PostgreSQL database. Implements backward-compatible route handler for registration.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Request Body**:
  ```json
  {
    "full_name": "Surya Dev",
    "phone": "+919876543210",
    "role_name": "officer",
    "city_id": "c1a2e3f4-5555-6666-7777-888899990000"
  }
  ```
- **Response Status**: `201 Created`
- **Response Structure**: See response fields in `POST /auth/sync-profile`. Note: role_name defaults to `"citizen"` and geographic fields are protected against client-side escalation.

#### `POST /auth/sync-profile`
- **Description**: Secure profile synchronization endpoint. Safely maps User details from verified Supabase claims.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Request Body**: Same as `POST /users/profile`.
- **Response Status**: `200 OK`
- **Response Structure**:
  ```json
  {
    "id": "e47ac10b-58cc-4372-a567-0e02b2c3d499",
    "full_name": "Surya Dev",
    "email": "surya@bharatos.gov.in",
    "phone": "+919876543210",
    "role_name": "citizen",
    "city_id": null,
    "status": "active",
    "created_at": "2026-08-10T06:13:24Z",
    "updated_at": "2026-08-10T06:13:24Z",
    "scope": {
      "state_id": null,
      "district_id": null,
      "city_id": null
    }
  }
  ```

#### `GET /auth/me`
- **Description**: Retrieves the active profile context of the authenticated user. If a valid JWT is supplied but no database profile is found in PostgreSQL, returns `404 Not Found`.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Response Status**: `200 OK`
- **Response Structure**:
  ```json
  {
    "id": "e47ac10b-58cc-4372-a567-0e02b2c3d499",
    "full_name": "Surya Dev",
    "email": "surya@bharatos.gov.in",
    "phone": "+919876543210",
    "role_name": "citizen",
    "city_id": null,
    "status": "active",
    "created_at": "2026-08-10T06:13:24Z",
    "updated_at": "2026-08-10T06:13:24Z",
    "scope": {
      "state_id": "s1a2e3f4-5555-6666-7777-888899990000",
      "district_id": "d1a2e3f4-5555-6666-7777-888899990000",
      "city_id": null
    }
  }
  ```

#### `GET /auth/profile`
- **Description**: Alias for `GET /auth/me`.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Response Status**: `200 OK`
- **Response Structure**: Same as `GET /auth/me`.

#### `GET /auth/test`
- **Description**: Internal test endpoint to verify role matching and token verification.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Response Status**: `200 OK`
- **Response Structure**:
  ```json
  {
    "message": "Authentication successful.",
    "user_id": "e47ac10b-58cc-4372-a567-0e02b2c3d499",
    "email": "surya@bharatos.gov.in",
    "role": "citizen"
  }
  ```

---

### 2.2. Geographic Hierarchy & Command Structure

All geographic hierarchy endpoints require authentication (`Authorization: Bearer <Supabase_JWT_Token>`). Regional administrative operators are restricted based on their assigned geographic scope, while citizens and national administrators have broad access to metadata.

#### `GET /api/v1/states`
- **Description**: Returns all registered states.
- **Parameters**: `limit` (default: 50), `offset` (default: 0)
- **Response Status**: `200 OK`
- **Response Structure**:
  ```json
  [
    {
      "id": "e4584283-bc07-4f6c-b3a1-778899220011",
      "state_name": "Andhra Pradesh",
      "status": "active"
    }
  ]
  ```

#### `GET /api/v1/states/{state_id}`
- **Description**: Returns details for a specific state. Restricted by geographic scope.
- **Response Status**: `200 OK`, `403 Forbidden`, `404 Not Found`

#### `GET /api/v1/states/{state_id}/districts`
- **Description**: Returns all districts associated with a given state ID. Restricted by geographic scope.
- **Parameters**: `limit` (default: 50), `offset` (default: 0)
- **Response Status**: `200 OK`, `403 Forbidden`, `404 Not Found`

#### `GET /api/v1/districts/{district_id}`
- **Description**: Returns details for a specific district along with its parent state name. Restricted by geographic scope.
- **Response Status**: `200 OK`, `403 Forbidden`, `404 Not Found`
- **Response Structure**:
  ```json
  {
    "id": "c1a2e3f4-5555-6666-7777-888899990000",
    "state_id": "e4584283-bc07-4f6c-b3a1-778899220011",
    "state_name": "Andhra Pradesh",
    "district_name": "Visakhapatnam District",
    "status": "active"
  }
  ```

#### `GET /api/v1/districts/{district_id}/cities`
- **Description**: Returns cities belonging to a district. Restricted by geographic scope.
- **Parameters**: `limit` (default: 50), `offset` (default: 0)
- **Response Status**: `200 OK`, `403 Forbidden`, `404 Not Found`

#### `GET /api/v1/cities`
- **Description**: Returns all registered municipal cities (legacy/compatibility endpoint).
- **Parameters**: `limit` (default: 50), `offset` (default: 0)
- **Response Status**: `200 OK`
- **Response Structure**:
  ```json
  [
    {
      "id": "c1a2e3f4-5555-6666-7777-888899990000",
      "district_id": "d1a2e3f4-5555-6666-7777-888899990000",
      "city_name": "Visakhapatnam",
      "population": 2000000,
      "latitude": 17.6868,
      "longitude": 83.2185,
      "status": "active"
    }
  ]
  ```

#### `GET /api/v1/cities/{city_id}`
- **Description**: Returns detailed information for a city along with parent district and state names. Restricted by geographic scope.
- **Response Status**: `200 OK`, `403 Forbidden`, `404 Not Found`
- **Response Structure**:
  ```json
  {
    "id": "c1a2e3f4-5555-6666-7777-888899990000",
    "city_name": "Visakhapatnam",
    "district_id": "d1a2e3f4-5555-6666-7777-888899990000",
    "district_name": "Visakhapatnam District",
    "state_id": "e4584283-bc07-4f6c-b3a1-778899220011",
    "state_name": "Andhra Pradesh",
    "population": 2000000,
    "latitude": 17.6868,
    "longitude": 83.2185,
    "status": "active"
  }
  ```

#### `GET /api/v1/cities/{city_id}/zones`
- **Description**: Returns all zones inside a city. Restricted by geographic scope.
- **Parameters**: `limit` (default: 50), `offset` (default: 0)
- **Response Status**: `200 OK`, `403 Forbidden`, `404 Not Found`

#### `GET /api/v1/zones/{zone_id}/wards`
- **Description**: Returns wards inside a zone. Restricted by geographic scope.
- **Parameters**: `limit` (default: 50), `offset` (default: 0)
- **Response Status**: `200 OK`, `403 Forbidden`, `404 Not Found`

#### `GET /api/v1/wards/{ward_id}`
- **Description**: Returns details for a specific ward along with its complete parent hierarchy (Zone, City, District, State). Restricted by geographic scope.
- **Response Status**: `200 OK`, `403 Forbidden`, `404 Not Found`
- **Response Structure**:
  ```json
  {
    "id": "w1a2e3f4-5555-6666-7777-888899990000",
    "ward_name": "Ward No. 1",
    "zone_id": "z1a2e3f4-5555-6666-7777-888899990000",
    "zone_name": "Zone One",
    "city_id": "c1a2e3f4-5555-6666-7777-888899990000",
    "city_name": "Visakhapatnam",
    "district_id": "d1a2e3f4-5555-6666-7777-888899990000",
    "district_name": "Visakhapatnam District",
    "state_id": "e4584283-bc07-4f6c-b3a1-778899220011",
    "state_name": "Andhra Pradesh"
  }
  ```

---

### 2.3. Incident Pipeline Management

#### `POST /incidents`
- **Description**: Reports a new emergency incident.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Request Body**:
  ```json
  {
    "category": "Flood",
    "title": "Severe Water Logging in Sector 4",
    "description": "Water logging blocking access roads, depth is approx 1.2m.",
    "latitude": 17.7212,
    "longitude": 83.3142,
    "address": "Sector 4, Beach Road, Visakhapatnam",
    "severity": "high"
  }
  ```
- **Response Status**: `201 Created`
- **Response Structure**:
  ```json
  {
    "id": "i1a2e3f4-5555-6666-7777-888899990000",
    "ticket_number": "BHR-2026-00042",
    "citizen_id": "u1a2e3f4-5555-6666-7777-888899990000",
    "category": "Flood",
    "title": "Severe Water Logging in Sector 4",
    "description": "Water logging blocking access roads, depth is approx 1.2m.",
    "latitude": 17.7212,
    "longitude": 83.3142,
    "address": "Sector 4, Beach Road, Visakhapatnam",
    "severity": "high",
    "status": "active",
    "created_at": "2026-08-10T06:20:00Z"
  }
  ```

#### `GET /incidents`
- **Description**: Retrieves incidents matching filter sets (category, status, severity, zone).
- **Response Status**: `200 OK`

#### `PATCH /incidents/{incident_id}/status`
- **Description**: Updates the progress status of a running incident ticket.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Request Body**:
  ```json
  {
    "status": "in_progress",
    "notes": "Rescue units dispatched to target coordinates."
  }
  ```

#### `POST /incidents/{incident_id}/assign`
- **Description**: Assigns the emergency incident to a department (Police, Fire, Disaster).
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Request Body**:
  ```json
  {
    "department_id": "dept-uuid-here",
    "notes": "Emergency unit deployed."
  }
  ```

---

### 2.4. Telemetry & Analytics Dashboard Aggregates

#### `GET /dashboard/summary`
- **Description**: Aggregates national counts for incidents grouped by active status and alerts.
- **Response Status**: `200 OK`
- **Response Structure**:
  ```json
  {
    "total_incidents": 1420,
    "active_incidents": 12,
    "assigned_incidents": 8,
    "in_progress_incidents": 24,
    "resolved_incidents": 1376,
    "critical_alerts": 4
  }
  ```

---

### 2.4.6. Emergency Facilities

#### `GET /facilities`
- **Description**: Lists facilities. Enforces geographic scope for scoped operators.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Query Parameters**:
  - `page` (int, default: 1)
  - `limit` (int, default: 20, max: 100)
  - `facility_type` (string, optional) -- e.g. `POLICE_STATION`, `HOSPITAL`
  - `state_id` (UUID, optional)
  - `district_id` (UUID, optional)
  - `city_id` (UUID, optional)
  - `zone_id` (UUID, optional)
  - `ward_id` (UUID, optional)
  - `source_type` (string, optional)
- **Response Status**: `200 OK`
- **Response Structure**:
  ```json
  {
    "items": [
      {
        "id": "e47ac10b-58cc-4372-a567-0e02b2c3d499",
        "name": "Vizag Central Hospital",
        "facility_type": "HOSPITAL",
        "address": "Maharanipeta, Visakhapatnam",
        "phone": "+91 891 256 1234",
        "latitude": 17.712,
        "longitude": 83.301,
        "state_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "district_id": "e47ac10b-58cc-4372-a567-0e02b2c3d480",
        "city_id": "d47ac10b-58cc-4372-a567-0e02b2c3d481",
        "zone_id": null,
        "ward_id": null,
        "source_type": "VERIFIED_PUBLIC",
        "source_name": "Andhra Pradesh Govt Health Portal",
        "source_url": "http://health.ap.gov.in",
        "verified_at": "2026-08-10T12:00:00Z",
        "extra_data": null,
        "created_at": "2026-08-10T06:13:24Z",
        "updated_at": "2026-08-10T06:13:24Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 1
  }
  ```

#### `GET /facilities/{facility_id}`
- **Description**: Fetches facility details by ID. Verifies geographic scope.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Response Status**: `200 OK` or `404 Not Found`

#### `POST /facilities`
- **Description**: Creates a new facility. Only available to administrative roles (`dept_head`, `state_admin`, `admin`, `national_admin`). Enforces geographic scope.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Request Body**:
  ```json
  {
    "name": "Demo Police Station",
    "facility_type": "POLICE_STATION",
    "address": "Beach Road, Visakhapatnam",
    "phone": "+918910000000",
    "latitude": 17.701,
    "longitude": 83.315,
    "state_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "city_id": "d47ac10b-58cc-4372-a567-0e02b2c3d481",
    "source_type": "SIMULATED"
  }
  ```
- **Response Status**: `201 Created` or `403 Forbidden`

#### `PATCH /facilities/{facility_id}`
- **Description**: Updates facility fields. Only available to administrative roles. Enforces geographic scope.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Request Body**:
  ```json
  {
    "name": "Updated Police Station Name"
  }
  ```
- **Response Status**: `200 OK`, `403 Forbidden` or `404 Not Found`

---

### 2.5. AI & Multi-Agent Triage

#### `POST /ai/triage`
- **Description**: Parses unstructured citizen reports into clean categorical schemas using Gemini.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Request Body**:
  ```json
  {
    "incident_description": "There is a big fire at the electrical transformer in ward 4 near main market"
  }
  ```
- **Response Status**: `200 OK`
- **Response Structure**:
  ```json
  {
    "category": "Fire",
    "severity": "critical",
    "department_code": "FIRE",
    "suggested_actions": [
      "Cut power grid grid lines to transformer",
      "Dispatch fire engine from Market Station"
    ]
  }
  ```

#### `POST /ai/chat`
- **Description**: Exposes the conversational multi-agent orchestrator. Allows users to query incidents, available resources, and active alerts, using bounded conversation histories. Implements scope resolution and RBAC checking. Supports multilingual English, Telugu, and Hindi queries.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Request Body**:
  ```json
  {
    "message": "What emergency resources are available in Visakhapatnam?",
    "history": [
      {
        "role": "user",
        "content": "Show me active incidents in Vizag."
      },
      {
        "role": "assistant",
        "content": "Found 2 active incidents."
      }
    ]
  }
  ```
- **Response Status**: `200 OK`
- **Response Structure**:
  ```json
  {
    "answer": "There are 5 emergency resources currently available.",
    "intent": "resource_query",
    "confidence": 93.0,
    "sources": [
      "Resource Management Service"
    ],
    "data": {
      "retrieved_records": [
        {
          "id": "e47ac10b-58cc-4372-a567-0e02b2c3d499",
          "name": "Vizag Ambulance 1",
          "type": "ambulance",
          "status": "available",
          "latitude": 17.68,
          "longitude": 83.21
        }
      ],
      "observability": {
        "user_id": "e47ac10b-58cc-4372-a567-0e02b2c3d499",
        "intent_detected": "resource_query",
        "latency_ms": 15.4,
        "model": "Gemini 2.5 Pro (Mock-Reasoning Fallback)"
      }
    },
    "recommendations": [
      "Consider deploying Vizag Ambulance 1 (ambulance) which is currently available."
    ],
    "warnings": []
  }
  ```

---

### 2.6. Alerts & Emergency Intelligence

#### `GET /alerts`
- **Description**: Lists paginated emergency alerts. Inherits geographic scope checks (users only see alerts matching their profile scope boundaries).
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Query Parameters**:
  - `page` (int, default 1)
  - `limit` (int, default 20)
  - `severity` (string: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
  - `status` (string: `ACTIVE`, `ACKNOWLEDGED`, `RESOLVED`, `EXPIRED`)
  - `alert_type` (string: `WEATHER`, `FLOOD`, `WATER_LEVEL`, etc.)
  - `source` (string)
  - `state_id` (UUID)
  - `city_id` (UUID)
  - `date_from` (ISO datetime)
  - `date_to` (ISO datetime)
- **Response Status**: `200 OK`

#### `GET /alerts/summary`
- **Description**: Returns counts of alerts aggregated by status and severity, restricted to the user's geographic authorization scope.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Response Status**: `200 OK`
- **Response Structure**:
  ```json
  {
    "total": 10,
    "active": 5,
    "acknowledged": 2,
    "resolved": 2,
    "expired": 1,
    "critical": 1,
    "high": 3,
    "medium": 4,
    "low": 2
  }
  ```

#### `GET /alerts/{alert_id}`
- **Description**: Retrieves detailed information for a single alert. Raises `404 Not Found` if missing, or `403 Forbidden` if the alert lies outside the user's scope.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Response Status**: `200 OK`

#### `POST /alerts`
- **Description**: Creates a new emergency alert. Restricted to roles: `admin`, `national_admin`, `state_admin`, `dept_head`.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Request Body**:
  ```json
  {
    "title": "Cyclone Warning",
    "description": "High wind speeds and rainfall forecast for coastal areas.",
    "severity": "HIGH",
    "category": "WEATHER",
    "state_id": "s1a2e3f4-5555-6666-7777-888899990000",
    "city_id": "c1a2e3f4-5555-6666-7777-888899990000",
    "expires_at": "2026-08-11T12:00:00Z"
  }
  ```
- **Response Status**: `201 Created`

#### `PATCH /alerts/{alert_id}/acknowledge`
- **Description**: Validates and updates lifecycle status from `ACTIVE` to `ACKNOWLEDGED`. Restricted to authorized operational roles. Logs audit action `ALERT_ACKNOWLEDGED`.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Response Status**: `200 OK`, `400 Bad Request` (invalid status transition) or `403 Forbidden`.

#### `PATCH /alerts/{alert_id}/resolve`
- **Description**: Validates and updates status to `RESOLVED` (supports transition from `ACTIVE` or `ACKNOWLEDGED`). Restricted to authorized roles. Logs audit action `ALERT_RESOLVED`.
- **Headers**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Response Status**: `200 OK`, `400 Bad Request` or `403 Forbidden`.

---

## 3. WebSockets Real-Time Topics

- **`ws://localhost:8000/ws/dashboard`**: Emits real-time aggregates and overall network health calculations.
- **`ws://localhost:8000/ws/sensors`**: Streams active sensor measurements.
- **`ws://localhost:8000/ws/incidents`**: Pushes immediate JSON updates when incidents are reported or assigned.
- **`ws://localhost:8000/ws/notifications`**: Broadcasts alerts to relevant client connections.
