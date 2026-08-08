# API Design

# BharatOS - REST API Specification

---

# Overview

BharatOS exposes a RESTful API built with **FastAPI**. All endpoints return JSON objects and use standard HTTP status codes.

Authentication is handled via JWT tokens issued by Supabase Auth and passed inside the `Authorization` header.

---

# API Parameters

## Base URLs
- **Local Development**: `http://localhost:8000/api/v1`
- **Production Server**: `https://api.bharatos.ai/api/v1`

## Request Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## Global JSON Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid request parameters provided",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "The 'latitude' field must be a valid number."
  }
}
```

---

# Authentication APIs

### 1. User Registration (`POST /auth/register`)
Creates a new user record.
- **Request Body**:
```json
{
  "email": "citizen@bharatos.in",
  "password": "SecurePassword123",
  "full_name": "Surya Kumar",
  "phone": "+919876543210",
  "city_id": "8f8b3b64-1e0e-436f-8468-b78bf9ad4f12"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": "d748f32c-63b7-4c4c-83b6-123456789abc",
    "email": "citizen@bharatos.in",
    "role": "citizen"
  }
}
```

### 2. User Login (`POST /auth/login`)
Signs in a user and returns a token.
- **Request Body**:
```json
{
  "email": "officer@bharatos.in",
  "password": "SecurePassword123"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "f48af291-a12b-439d-b8d9-cf29381023ba",
    "user": {
      "id": "c129e843-1bc2-4d2d-8e43-128943abde12",
      "full_name": "Ramesh Naidu",
      "role": "officer",
      "city_id": "8f8b3b64-1e0e-436f-8468-b78bf9ad4f12"
    }
  }
}
```

---

# Incident APIs

### 1. Create Incident (`POST /incidents`)
Reports a new incident. Citizens and officers can access this endpoint.
- **Request Body**:
```json
{
  "title": "Severe flooding on Beach Road",
  "description": "Water logging has reached 2 feet near Novotel. Traffic is stalled.",
  "category": "Flood",
  "priority": "high",
  "latitude": 17.7215,
  "longitude": 83.3245,
  "city_id": "8f8b3b64-1e0e-436f-8468-b78bf9ad4f12",
  "zone_id": "3a1c8f1e-bc92-4f3b-b23d-4c8d9e2b1c45"
}
```
- **Response (210 Created)**:
```json
{
  "success": true,
  "message": "Incident reported successfully. AI Engine triggered.",
  "data": {
    "incident_id": "a9843c1b-21d3-4fbc-b82e-9d21c432baef",
    "status": "pending",
    "created_at": "2026-08-06T19:50:00Z"
  }
}
```

### 2. Update Incident Details (`PUT /incidents/{incidentId}`)
Updates editable fields on a ticket.
- **Request Body**:
```json
{
  "title": "Severe flooding and gridlock on Beach Road",
  "priority": "critical"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Incident details updated",
  "data": {
    "id": "a9843c1b-21d3-4fbc-b82e-9d21c432baef",
    "priority": "critical"
  }
}
```

### 3. Change Incident Status (`PATCH /incidents/{incidentId}/status`)
Updates the operational lifecycle state of the incident.
- **Request Body**:
```json
{
  "status": "in_progress",
  "notes": "Emergency teams are setting up water pumps on site."
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Incident status updated successfully",
  "data": {
    "id": "a9843c1b-21d3-4fbc-b82e-9d21c432baef",
    "status": "in_progress",
    "updated_at": "2026-08-06T19:52:12Z"
  }
}
```

---

# Incident Assignment APIs

### 1. Assign Incident (`POST /incidents/{incidentId}/assign`)
Assigns an officer or department to an incident.
- **Request Body**:
```json
{
  "assigned_officer_id": "f8423d21-6b8c-4a3d-a72e-1289ab4cde56",
  "assigned_department_id": "d1284b12-9c3f-4e5a-8b1a-cf29381023ba"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Incident successfully assigned",
  "data": {
    "assignment_id": "c71a3f8b-bd29-4c8d-8a2e-1289ab4cde56",
    "incident_id": "a9843c1b-21d3-4fbc-b82e-9d21c432baef",
    "status": "pending"
  }
}
```

---

# Police, Fire & Healthcare Assets APIs

### 1. Get Assets List (`GET /digital-twin/assets`)
Returns lists of geo-mapped landmarks.
- **Parameters**: `city_id` (Query, Required)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Assets loaded successfully",
  "data": {
    "hospitals": [
      {
        "id": "h1283d91-e4f1-432d-98e3-ab12de34ab78",
        "name": "Seven Hills Hospital",
        "latitude": 17.7210,
        "longitude": 83.3150,
        "available_beds": 12,
        "icu_available": 3
      }
    ],
    "police_stations": [
      {
        "id": "p8492a18-e3c2-491d-bf2c-ac19de234ab1",
        "name": "Beach Police Station",
        "latitude": 17.7230,
        "longitude": 83.3260,
        "officers_available": 15
      }
    ],
    "fire_stations": [
      {
        "id": "f9402a92-d3c2-4a1d-cf2a-9d21cb34e12a",
        "name": "Visakhapatnam Fire HQ",
        "latitude": 17.7180,
        "longitude": 83.3090,
        "engines_available": 4
      }
    ]
  }
}
```

### 2. Update Fire Station Capacity (`PUT /fire-stations/{stationId}`)
Updates available engines count.
- **Request Body**:
```json
{
  "engines_available": 2
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Fire station capacity updated",
  "data": {
    "id": "f9402a92-d3c2-4a1d-cf2a-9d21cb34e12a",
    "engines_available": 2
  }
}
```

---

# Administrative Levels APIs

### 1. Get Wards in Zone (`GET /zones/{zoneId}/wards`)
Returns wards associated with a specific zone.
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Wards retrieved successfully",
  "data": [
    {
      "id": "w918f3b2-bd23-4f91-82de-928ab312cd56",
      "ward_name": "Ward 14 (Novotel Beach)"
    }
  ]
}
```

---

# AI & Simulation APIs

### 1. Get AI Recommendation (`POST /ai/recommendation`)
Triggers the multi-agent graph to compute actions for an incident.
- **Request Body**:
```json
{
  "incident_id": "a9843c1b-21d3-4fbc-b82e-9d21c432baef"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Recommendation generated by Coordinator Agent",
  "data": {
    "recommendation_id": "r93d2b12-ca9d-43ef-b2c3-cf29381023ba",
    "actions": [
      {
        "type": "deploy_resource",
        "detail": "Dispatch 1 Ambulance from Seven Hills Hospital",
        "target_id": "h1283d91-e4f1-432d-98e3-ab12de34ab78"
      },
      {
        "type": "divert_traffic",
        "detail": "Divert vehicles from Beach Road to VIP Road",
        "route_id": "rt_beach_road"
      }
    ],
    "explanation": "Flooding risks are high based on Weather Agent rain values (12mm/hr) and traffic density indexes.",
    "confidence": "high"
  }
}
```

### 2. Simulate Sensor Value (`POST /sensors/simulate`)
Updates a simulated IoT sensor value to test real-time AI reactions.
- **Request Body**:
```json
{
  "sensor_id": "s82c3b21-4d32-4f3e-bc91-9e283b1023ba",
  "value": 3.8
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Simulated sensor value updated. Triggers sent via WebSockets.",
  "data": {
    "sensor_id": "s82c3b21-4d32-4f3e-bc91-9e283b1023ba",
    "value": 3.8,
    "timestamp": "2026-08-06T19:54:00Z"
  }
}
```

---

# Admin & Audit APIs

### 1. Get Audit Logs (`GET /admin/audit-logs`)
Admin view to query audit logs.
- **Parameters**: `user_id` (Query, Optional), `action` (Query, Optional), `limit` (Query, Default: 50)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Audit logs retrieved",
  "data": [
    {
      "id": 182,
      "user_id": "c129e843-1bc2-4d2d-8e43-128943abde12",
      "action": "approve_recommendation",
      "table_name": "ai_recommendations",
      "record_id": "r93d2b12-ca9d-43ef-b2c3-cf29381023ba",
      "created_at": "2026-08-06T19:55:00Z"
    }
  ]
}
```

---

# WebSocket Events Specification

When changes occur in the database, the backend broadcasts event envelopes over WebSockets:

### 1. Incident Status Update Event
**Topic**: `realtime:incidents`
```json
{
  "event": "UPDATE",
  "table": "incidents",
  "payload": {
    "id": "a9843c1b-21d3-4fbc-b82e-9d21c432baef",
    "status": "in_progress",
    "updated_at": "2026-08-06T19:52:12Z"
  }
}
```

### 2. Sensor Telemetry Update Event
**Topic**: `realtime:sensor_data`
```json
{
  "event": "UPDATE",
  "table": "sensor_data",
  "payload": {
    "id": "s82c3b21-4d32-4f3e-bc91-9e283b1023ba",
    "sensor_type": "water_level",
    "value": 3.8,
    "timestamp": "2026-08-06T19:54:00Z"
  }
}
```
