# Database Design

# BharatOS - Database Architecture

---

# Overview

BharatOS uses **Supabase PostgreSQL** as its primary database.

The database is designed to support:

- AI-powered governance
- Digital Twin infrastructure
- Multi-agent workflows
- Real-time synchronization
- Role-based access control
- Scalable city onboarding

The schema follows a relational design while supporting vector search (pgvector) for AI features.

---

# Database Architecture

```

Users
│
├── Citizen
├── Officer
├── Admin

↓

Cities

↓

Zones

↓

Incidents

↓

Departments

↓

Resources

↓

AI Recommendations

↓

Reports

```

---

# Core Tables

## 1. users

Stores all platform users.

Fields:

- id
- full_name
- email
- phone
- role
- language
- profile_image
- city_id
- status
- created_at

---

## 2. cities

Stores supported cities.

Fields:

- id
- state
- city_name
- population
- latitude
- longitude
- status

Example:

- Visakhapatnam
- Hyderabad
- Bengaluru

---

## 3. zones

Each city is divided into operational zones.

Fields:

- id
- city_id
- zone_name
- polygon
- risk_level

---

## 4. wards

Optional lower-level administrative units.

Fields:

- id
- zone_id
- ward_name

---

## 5. departments

Government departments.

Examples:

- Police
- Fire
- Hospital
- Municipal
- Disaster Management

---

## 6. officers

Officer profiles.

Fields:

- id
- user_id
- department_id
- designation
- station

---

## 7. incidents

Most important table.

Stores every reported event.

Fields:

- id
- title
- description
- category
- priority
- latitude
- longitude
- status
- city_id
- zone_id
- reporter_id
- created_at

Categories

- Flood
- Fire
- Accident
- Garbage
- Water Leakage
- Medical

---

## 8. incident_images

Stores uploaded images.

Fields:

- id
- incident_id
- image_url
- ai_result

---

## 9. ai_recommendations

Stores AI outputs.

Fields:

- id
- incident_id
- recommendation
- confidence
- explanation
- generated_at

---

## 10. hospitals

Fields:

- id
- hospital_name
- latitude
- longitude
- total_beds
- available_beds
- icu_available

---

## 11. ambulances

Fields:

- id
- hospital_id
- status
- driver
- latitude
- longitude

---

## 12. police_stations

Fields:

- id
- station_name
- latitude
- longitude
- officers_available

---

## 13. fire_stations

Fields:

- id
- station_name
- engines_available

---

## 14. weather_data

Stores weather snapshots.

Fields:

- city_id
- rainfall
- temperature
- humidity
- wind_speed
- recorded_at

---

## 15. sensor_data

Simulated IoT data.

Fields:

- id
- sensor_type
- city_id
- zone_id
- value
- unit
- timestamp

Sensor Types

- Water Level
- Temperature
- AQI
- Traffic Count

---

## 16. notifications

Stores alerts.

Fields:

- user_id
- title
- message
- priority
- is_read

---

## 17. reports

AI-generated reports.

Types

- Daily
- Weekly
- Monthly
- Incident

---

## 18. ai_logs

Stores AI activity.

Fields:

- agent_name
- input
- output
- execution_time
- confidence

Useful for debugging and auditing.

---

## 19. audit_logs

Tracks user actions.

Examples:

- Login
- Incident updated
- Recommendation approved

---

## 20. knowledge_base

Stores RAG documents.

Fields:

- title
- category
- document_url
- embedding
- source

Examples:

- NDMA Guidelines
- Flood SOP
- Fire SOP

---

# Relationships

users

↓

incidents

↓

ai_recommendations

↓

reports

cities

↓

zones

↓

wards

↓

incidents

departments

↓

officers

↓

incident assignments

---

# Storage Buckets

Supabase Storage

Buckets:

- incident-images
- reports
- documents
- avatars

---

# Realtime Tables

Realtime enabled:

- incidents
- notifications
- sensor_data
- ai_recommendations
- weather_data

---

# Security

Row-Level Security enabled.

Examples:

Citizen

Can only view:

- Their profile
- Their complaints

Officer

Can view:

- Assigned incidents
- Department resources

Admin

Can access all records.

---

# Indexes

Indexes on:

- city_id
- zone_id
- category
- status
- created_at
- latitude
- longitude

This improves dashboard and map performance.

---

# Future Expansion

Additional tables can support:

- Drone feeds
- CCTV cameras
- Utility infrastructure
- Public transport
- School safety
- Electricity grid
- Water pipelines
- Railway monitoring

---

# Summary

The BharatOS database is designed to support real-time governance, AI-assisted decision making, Digital Twin visualization, and scalable city onboarding. PostgreSQL with Supabase provides authentication, storage, realtime updates, and vector search capabilities while maintaining security through Row-Level Security and role-based access.