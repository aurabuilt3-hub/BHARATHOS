# API Design

# BharatOS - REST API Specification

---

# Overview

BharatOS exposes a RESTful API built with FastAPI.

The API is divided into logical modules to keep the system modular and scalable.

All endpoints return JSON responses.

Authentication is handled using JWT tokens provided by Supabase Authentication.

---

# API Base URL

Development

```
http://localhost:8000/api/v1
```

Production

```
https://api.bharatos.ai/api/v1
```

---

# Authentication

Authorization Header

```
Authorization: Bearer <JWT_TOKEN>
```

---

# Response Format

Success

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

---

Error

```json
{
  "success": false,
  "message": "Invalid request",
  "error": {}
}
```

---

# Authentication APIs

## Login

POST

```
/auth/login
```

---

## Register

POST

```
/auth/register
```

---

## Logout

POST

```
/auth/logout
```

---

## Refresh Token

POST

```
/auth/refresh
```

---

## Current User

GET

```
/auth/me
```

---

# User APIs

## Get Profile

GET

```
/users/profile
```

---

## Update Profile

PUT

```
/users/profile
```

---

## Upload Avatar

POST

```
/users/avatar
```

---

# Dashboard APIs

## National Dashboard

GET

```
/dashboard/national
```

Returns:

- National statistics
- Active incidents
- Disaster overview
- AI insights

---

## State Dashboard

GET

```
/dashboard/state/{stateId}
```

---

## City Dashboard

GET

```
/dashboard/city/{cityId}
```

---

## Zone Dashboard

GET

```
/dashboard/zone/{zoneId}
```

---

# Incident APIs

## Create Incident

POST

```
/incidents
```

---

## Get Incidents

GET

```
/incidents
```

Supports filters:

- city
- category
- priority
- status
- date

---

## Incident Details

GET

```
/incidents/{incidentId}
```

---

## Update Incident

PUT

```
/incidents/{incidentId}
```

---

## Delete Incident

DELETE

```
/incidents/{incidentId}
```

---

## Upload Incident Image

POST

```
/incidents/{incidentId}/image
```

---

## Change Incident Status

PATCH

```
/incidents/{incidentId}/status
```

Status:

Pending

Assigned

In Progress

Resolved

Closed

---

# AI APIs

## AI Recommendation

POST

```
/ai/recommendation
```

Returns

- Recommendation
- Confidence Score
- Explanation

---

## AI Chat

POST

```
/ai/chat
```

Natural language queries.

Examples:

- Show flood risk
- Nearby hospitals
- Active incidents

---

## AI Vision

POST

```
/ai/vision
```

Input

Image

Output

- Category
- Confidence
- Severity

---

## AI Voice

POST

```
/ai/voice
```

Supports:

- Speech to Text
- AI Processing
- Text to Speech

---

## AI Report

POST

```
/ai/report
```

Generate:

- Daily Report
- Weekly Report
- Monthly Report

---

# Weather APIs

## Current Weather

GET

```
/weather/current
```

---

## Forecast

GET

```
/weather/forecast
```

---

## Flood Prediction

GET

```
/weather/flood-risk
```

---

# Traffic APIs

## Live Traffic

GET

```
/traffic/live
```

---

## Congestion Prediction

GET

```
/traffic/prediction
```

---

## Suggested Routes

GET

```
/traffic/routes
```

---

# Healthcare APIs

## Hospitals

GET

```
/hospitals
```

---

## Hospital Details

GET

```
/hospitals/{hospitalId}
```

---

## Bed Availability

GET

```
/hospitals/availability
```

---

## Ambulances

GET

```
/ambulances
```

---

# Emergency APIs

## Active Emergencies

GET

```
/emergencies
```

---

## Dispatch Team

POST

```
/emergencies/dispatch
```

---

## Response Status

GET

```
/emergencies/status
```

---

# Notification APIs

## Notifications

GET

```
/notifications
```

---

## Mark Read

PATCH

```
/notifications/read
```

---

## Delete Notification

DELETE

```
/notifications/{notificationId}
```

---

# Analytics APIs

## Dashboard Analytics

GET

```
/analytics/dashboard
```

---

## Incident Analytics

GET

```
/analytics/incidents
```

---

## Department Analytics

GET

```
/analytics/departments
```

---

# Report APIs

## Generate Report

POST

```
/reports/generate
```

---

## Report History

GET

```
/reports
```

---

## Download Report

GET

```
/reports/{reportId}/download
```

---

# Digital Twin APIs

## City Map

GET

```
/digital-twin/map
```

---

## Assets

GET

```
/digital-twin/assets
```

Returns

- Hospitals
- Police Stations
- Fire Stations
- Schools
- Shelters

---

## Live Layer

GET

```
/digital-twin/live
```

---

# Sensor APIs

## Sensor Data

GET

```
/sensors
```

---

## Simulated Sensor Update

POST

```
/sensors/simulate
```

---

# Knowledge Base APIs

## Search Documents

GET

```
/knowledge/search
```

---

## Upload Document

POST

```
/knowledge/upload
```

---

# Admin APIs

## Users

GET

```
/admin/users
```

---

## Departments

GET

```
/admin/departments
```

---

## Cities

GET

```
/admin/cities
```

---

## System Logs

GET

```
/admin/logs
```

---

# WebSocket Events

Real-time events include:

- incident_created
- incident_updated
- incident_resolved
- ai_recommendation_ready
- weather_alert
- traffic_alert
- notification_received
- sensor_updated
- dashboard_refresh

---

# HTTP Status Codes

200

Success

201

Created

400

Bad Request

401

Unauthorized

403

Forbidden

404

Not Found

500

Internal Server Error

---

# API Versioning

Current Version

```
v1
```

Future versions

```
v2
v3
```

will remain backward compatible where possible.

---

# Summary

The BharatOS API follows REST principles, supports secure JWT authentication, real-time updates, and modular endpoints for AI, Digital Twin visualization, incident management, analytics, and administration. The design enables clean integration between the frontend, backend, AI engine, and external services while remaining scalable for future expansion.