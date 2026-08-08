# Database Design

# BharatOS - Database Architecture

---

# Overview

BharatOS uses **Supabase PostgreSQL** as its primary relational database.

The database is designed to support:
- Hierarchical city onboarding (`states → districts → cities → zones → wards`)
- Real-time mapping and vehicle tracking
- Explainable multi-agent AI logging
- RAG-based semantic document searches using `pgvector`
- Strict Role-Based Access Control (RBAC) and Row-Level Security (RLS)

---

# Database Entity Diagram

```
[states]
   │
   ▼
[districts]
   │
   ▼
[cities] ─── [users] (Role-based: Citizen, Officer, Admin)
   │            │
   ▼            ▼
[zones]  ─── [incidents] ─── [incident_assignments] ─── [officers]
   │            │                                           │
   ▼            ▼                                           ▼
[wards]  ─── [incident_images]                         [departments]
                │                                           │
                ▼                                           ▼
         [ai_recommendations]                      [police_stations]
                │                                  [fire_stations]
                ▼                                  [hospitals]
         [resource_assignments]                     [ambulances]
                │                                           │
                ▼                                           ▼
         [emergency_teams] ──────────────────────── [vehicle_tracking]
```

---

# Detailed Table Schemas

## 1. states
Stores states/union territories in India.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `state_name`: `VARCHAR(100)` (Unique, Not Null)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- `status`: `VARCHAR(20)` (Default: `'active'`)

---

## 2. districts
Stores districts within states.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `state_id`: `UUID` (Foreign Key referencing `states.id`, On Delete Cascade)
- `district_name`: `VARCHAR(100)` (Not Null)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- `status`: `VARCHAR(20)` (Default: `'active'`)
- *Index*: `idx_districts_state` on `state_id`

---

## 3. cities
Stores cities within districts.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `district_id`: `UUID` (Foreign Key referencing `districts.id`, On Delete Cascade)
- `city_name`: `VARCHAR(100)` (Not Null)
- `population`: `INTEGER`
- `latitude`: `DOUBLE PRECISION` (Not Null)
- `longitude`: `DOUBLE PRECISION` (Not Null)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- `status`: `VARCHAR(20)` (Default: `'active'`)
- *Index*: `idx_cities_district` on `district_id`

---

## 4. zones
Administrative zones inside cities.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `city_id`: `UUID` (Foreign Key referencing `cities.id`, On Delete Cascade)
- `zone_name`: `VARCHAR(100)` (Not Null)
- `polygon`: `JSONB` (GeoJSON polygon coordinates representing the zone boundaries)
- `risk_level`: `VARCHAR(20)` (Default: `'low'`)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- *Index*: `idx_zones_city` on `city_id`

---

## 5. wards
Wards inside zones.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `zone_id`: `UUID` (Foreign Key referencing `zones.id`, On Delete Cascade)
- `ward_name`: `VARCHAR(100)` (Not Null)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- *Index*: `idx_wards_zone` on `zone_id`

---

## 6. users
All users registered on the platform.
- `id`: `UUID` (Primary Key, matches Supabase `auth.users.id`)
- `full_name`: `VARCHAR(150)` (Not Null)
- `email`: `VARCHAR(255)` (Unique, Not Null)
- `phone`: `VARCHAR(20)`
- `role`: `VARCHAR(30)` (Not Null, Enum: `'citizen'`, `'officer'`, `'dept_head'`, `'admin'`, `'state_admin'`, `'national_admin'`)
- `language`: `VARCHAR(10)` (Default: `'en'`)
- `profile_image`: `VARCHAR(512)`
- `city_id`: `UUID` (Foreign Key referencing `cities.id`, Nullable for regional/national roles)
- `status`: `VARCHAR(20)` (Default: `'active'`)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- *Index*: `idx_users_role` on `role`, `idx_users_city` on `city_id`

---

## 7. departments
Government departments.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `name`: `VARCHAR(100)` (Not Null, Unique)
- `code`: `VARCHAR(20)` (Unique, e.g., `'POLICE'`, `'FIRE'`, `'HEALTH'`, `'MUNICIPAL'`)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- `status`: `VARCHAR(20)` (Default: `'active'`)

---

## 8. officers
Details of government officers.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `user_id`: `UUID` (Foreign Key referencing `users.id`, On Delete Cascade)
- `department_id`: `UUID` (Foreign Key referencing `departments.id`, On Delete Restrict)
- `designation`: `VARCHAR(100)`
- `station`: `VARCHAR(150)` (Station or post name)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- *Index*: `idx_officers_user` on `user_id`, `idx_officers_department` on `department_id`

---

## 9. incidents
Primary ticket table storing reported events.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `title`: `VARCHAR(200)` (Not Null)
- `description`: `TEXT`
- `category`: `VARCHAR(50)` (Not Null) -- Enum check constraint: `'Flood'`, `'Fire'`, `'Medical'`, `'Accident'`, `'Garbage'`, `'Water Leakage'`, `'Pothole'`, `'Street Light Failure'`, `'Fallen Tree'`, `'Infrastructure Damage'`
- `priority`: `VARCHAR(20)` (Not Null, Enum: `'critical'`, `'high'`, `'medium'`, `'low'`)
- `latitude`: `DOUBLE PRECISION` (Not Null)
- `longitude`: `DOUBLE PRECISION` (Not Null)
- `status`: `VARCHAR(30)` (Not Null, Default: `'pending'`) -- Enum: `'pending'`, `'assigned'`, `'in_progress'`, `'resolved'`, `'closed'`
- `city_id`: `UUID` (Foreign Key referencing `cities.id`, On Delete Restrict)
- `zone_id`: `UUID` (Foreign Key referencing `zones.id`, On Delete Restrict)
- `ward_id`: `UUID` (Foreign Key referencing `wards.id`, On Delete Restrict, Nullable)
- `reporter_id`: `UUID` (Foreign Key referencing `users.id`, On Delete Set Null)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- *Indexes*: `idx_incidents_status` on `status`, `idx_incidents_category` on `category`, `idx_incidents_coords` on (`latitude`, `longitude`)

---

## 10. incident_images
Image attachments for incidents.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `incident_id`: `UUID` (Foreign Key referencing `incidents.id`, On Delete Cascade)
- `image_url`: `VARCHAR(512)` (Not Null)
- `ai_result`: `JSONB` (Stores details returned by Vision AI: detected objects, bounding boxes, labels)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)

---

## 11. incident_assignments
Tracks which officers or departments are assigned to resolve an incident.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `incident_id`: `UUID` (Foreign Key referencing `incidents.id`, On Delete Cascade)
- `assigned_officer_id`: `UUID` (Foreign Key referencing `officers.id`, On Delete Set Null)
- `assigned_department_id`: `UUID` (Foreign Key referencing `departments.id`, On Delete Restrict)
- `status`: `VARCHAR(30)` (Default: `'pending'`) -- Enum: `'pending'`, `'accepted'`, `'declined'`, `'in_progress'`, `'resolved'`
- `assigned_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- *Index*: `idx_assignments_incident` on `incident_id`, `idx_assignments_officer` on `assigned_officer_id`

---

## 12. ai_recommendations
Stores AI Engine outputs for incidents.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `incident_id`: `UUID` (Foreign Key referencing `incidents.id`, On Delete Cascade)
- `recommendation`: `JSONB` (Structured actions proposed by the Coordinator Agent)
- `confidence`: `VARCHAR(20)` (Enum: `'very_high'`, `'high'`, `'medium'`, `'low'`)
- `explanation`: `TEXT` (Reasoning and citations of SOP files)
- `generated_at`: `TIMESTAMPTZ` (Default: `now()`)
- *Index*: `idx_ai_rec_incident` on `incident_id`

---

## 13. resource_assignments
Specific hardware or municipal assets assigned to respond.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `incident_id`: `UUID` (Foreign Key referencing `incidents.id`, On Delete Cascade)
- `resource_type`: `VARCHAR(50)` (e.g. `'Ambulance'`, `'Fire Engine'`, `'Police Patrol'`)
- `resource_id`: `UUID` (Foreign Key to specific hospital/station tables or tracking entities)
- `status`: `VARCHAR(30)` (Default: `'dispatched'`) -- Enum: `'dispatched'`, `'en_route'`, `'on_scene'`, `'released'`
- `dispatched_at`: `TIMESTAMPTZ` (Default: `now()`)
- `arrived_at`: `TIMESTAMPTZ`
- `released_at`: `TIMESTAMPTZ`

---

## 14. emergency_teams
Tracks physical teams (e.g. NDRF Squad, municipal crew) deployed.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `team_name`: `VARCHAR(100)` (Not Null)
- `department_id`: `UUID` (Foreign Key referencing `departments.id`)
- `leader_name`: `VARCHAR(100)`
- `contact_number`: `VARCHAR(20)`
- `status`: `VARCHAR(30)` (Default: `'idle'`) -- Enum: `'idle'`, `'deployed'`, `'offline'`
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)

---

## 15. vehicle_tracking
Real-time coordinates of active response vehicles.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `vehicle_type`: `VARCHAR(30)` (Enum: `'ambulance'`, `'police'`, `'fire_engine'`)
- `vehicle_ref_id`: `UUID` (Foreign Key referencing `ambulances.id` or related asset)
- `latitude`: `DOUBLE PRECISION` (Not Null)
- `longitude`: `DOUBLE PRECISION` (Not Null)
- `bearing`: `REAL` (Direction of movement)
- `speed`: `REAL` (Speed in km/h)
- `status`: `VARCHAR(20)` (Enum: `'en_route'`, `'arrived'`, `'returning'`, `'inactive'`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- *Index*: `idx_vehicle_coords` on (`latitude`, `longitude`)

---

## 16. hospitals
Emergency healthcare assets.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `city_id`: `UUID` (Foreign Key referencing `cities.id`)
- `hospital_name`: `VARCHAR(150)` (Not Null)
- `latitude`: `DOUBLE PRECISION` (Not Null)
- `longitude`: `DOUBLE PRECISION` (Not Null)
- `total_beds`: `INTEGER` (Default: 0)
- `available_beds`: `INTEGER` (Default: 0)
- `icu_available`: `INTEGER` (Default: 0)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- `status`: `VARCHAR(20)` (Default: `'active'`)

---

## 17. ambulances
Ambulance units associated with hospitals.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `hospital_id`: `UUID` (Foreign Key referencing `hospitals.id`, On Delete Cascade)
- `status`: `VARCHAR(30)` (Default: `'available'`) -- Enum: `'available'`, `'dispatched'`, `'busy'`, `'offline'`
- `driver`: `VARCHAR(100)`
- `phone`: `VARCHAR(20)`
- `latitude`: `DOUBLE PRECISION` (Not Null)
- `longitude`: `DOUBLE PRECISION` (Not Null)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)

---

## 18. police_stations
Police station locations.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `city_id`: `UUID` (Foreign Key referencing `cities.id`)
- `station_name`: `VARCHAR(150)` (Not Null)
- `latitude`: `DOUBLE PRECISION` (Not Null)
- `longitude`: `DOUBLE PRECISION` (Not Null)
- `officers_available`: `INTEGER` (Default: 0)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- `status`: `VARCHAR(20)` (Default: `'active'`)

---

## 19. fire_stations
Fire department station locations.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `city_id`: `UUID` (Foreign Key referencing `cities.id`)
- `station_name`: `VARCHAR(150)` (Not Null)
- `latitude`: `DOUBLE PRECISION` (Not Null) -- Added field for geo-mapping
- `longitude`: `DOUBLE PRECISION` (Not Null) -- Added field for geo-mapping
- `engines_available`: `INTEGER` (Default: 0)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)
- `status`: `VARCHAR(20)` (Default: `'active'`)

---

## 20. weather_data
Weather logs and metrics per city.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `city_id`: `UUID` (Foreign Key referencing `cities.id`, On Delete Cascade)
- `rainfall`: `REAL` (Rainfall in mm)
- `temperature`: `REAL` (Temp in Celsius)
- `humidity`: `REAL` (Percentage)
- `wind_speed`: `REAL` (km/h)
- `recorded_at`: `TIMESTAMPTZ` (Default: `now()`)
- *Index*: `idx_weather_city_time` on (`city_id`, `recorded_at` DESC)

---

## 21. sensor_data
IoT telemetry counts.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `sensor_type`: `VARCHAR(50)` (Not Null) -- Enum: `'water_level'`, `'temperature'`, `'aqi'`, `'traffic_count'`
- `city_id`: `UUID` (Foreign Key referencing `cities.id`, On Delete Cascade)
- `zone_id`: `UUID` (Foreign Key referencing `zones.id`, On Delete Cascade)
- `latitude`: `DOUBLE PRECISION` (Not Null) -- Added coordinates for spatial twin mapping
- `longitude`: `DOUBLE PRECISION` (Not Null) -- Added coordinates for spatial twin mapping
- `value`: `DOUBLE PRECISION` (Not Null)
- `unit`: `VARCHAR(20)` (e.g. `'m'`, `'C'`, `'ppm'`, `'units/hr'`)
- `timestamp`: `TIMESTAMPTZ` (Default: `now()`)
- *Index*: `idx_sensors_zone_type` on (`zone_id`, `sensor_type`)

---

## 22. notifications
System notifications and alerts.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `user_id`: `UUID` (Foreign Key referencing `users.id`, On Delete Cascade)
- `title`: `VARCHAR(150)` (Not Null)
- `message`: `TEXT` (Not Null)
- `priority`: `VARCHAR(20)` (Default: `'medium'`) -- Enum: `'critical'`, `'high'`, `'medium'`, `'low'`
- `is_read`: `BOOLEAN` (Default: `false`)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)

---

## 23. notification_preferences
Alert routing settings.
- `user_id`: `UUID` (Primary Key, Foreign Key referencing `users.id`, On Delete Cascade)
- `email_enabled`: `BOOLEAN` (Default: `false`)
- `sms_enabled`: `BOOLEAN` (Default: `false`)
- `push_enabled`: `BOOLEAN` (Default: `true`)
- `priority_threshold`: `VARCHAR(20)` (Default: `'medium'`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)

---

## 24. reports
Operational PDF/Excel reports generated by the Analytics Agent.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `city_id`: `UUID` (Foreign Key referencing `cities.id`)
- `report_type`: `VARCHAR(30)` (Enum: `'daily'`, `'weekly'`, `'monthly'`, `'disaster'`, `'department'`)
- `file_url`: `VARCHAR(512)` (Not Null)
- `summary`: `TEXT` (AI generated brief description)
- `generated_by`: `UUID` (Foreign Key referencing `users.id` or System User ID)
- `generated_at`: `TIMESTAMPTZ` (Default: `now()`)
- *Index*: `idx_reports_type_city` on (`city_id`, `report_type`)

---

## 25. ai_logs
Technical execution traces for AI agent monitoring.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `session_id`: `UUID` (Foreign Key referencing `ai_sessions.id` or nullable)
- `agent_name`: `VARCHAR(50)` (Not Null) -- e.g. `'coordinator'`, `'citizen'`, `'weather'`
- `input`: `JSONB`
- `output`: `JSONB`
- `execution_time_ms`: `INTEGER`
- `confidence`: `REAL`
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)

---

## 26. ai_sessions
Tracks user interaction sessions with the AI chatbot.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `user_id`: `UUID` (Foreign Key referencing `users.id`, On Delete Cascade)
- `session_token`: `VARCHAR(256)` (Unique)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `closed_at`: `TIMESTAMPTZ`

---

## 27. voice_logs
Raw audio file transcripts.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `user_id`: `UUID` (Foreign Key referencing `users.id`, On Delete Cascade)
- `audio_url`: `VARCHAR(512)` (Not Null)
- `raw_transcript`: `TEXT`
- `english_translation`: `TEXT`
- `detected_language`: `VARCHAR(10)`
- `processed_at`: `TIMESTAMPTZ` (Default: `now()`)

---

## 28. audit_logs
Tracks actions taken by users for verification.
- `id`: `BIGSERIAL` (Primary Key)
- `user_id`: `UUID` (Foreign Key referencing `users.id`, On Delete Set Null)
- `action`: `VARCHAR(100)` (Not Null) -- e.g. `'login'`, `'approve_recommendation'`, `'dispatch_officer'`
- `table_name`: `VARCHAR(100)`
- `record_id`: `UUID`
- `old_values`: `JSONB`
- `new_values`: `JSONB`
- `ip_address`: `VARCHAR(45)`
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- *Index*: `idx_audit_user_action` on (`user_id`, `action`)

---

## 29. map_layers
Configuration and URLs for Digital Twin visualization layers.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `layer_name`: `VARCHAR(100)` (Not Null)
- `layer_type`: `VARCHAR(30)` (Enum: `'tile'`, `'geojson'`, `'wms'`)
- `url`: `VARCHAR(512)` (Not Null)
- `is_active`: `BOOLEAN` (Default: `true`)
- `display_order`: `INTEGER` (Default: 0)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)

---

## 30. geo_assets
Static landmarks (e.g. Shelters, Schools) displayed as pins.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `city_id`: `UUID` (Foreign Key referencing `cities.id`, On Delete Cascade)
- `asset_name`: `VARCHAR(150)` (Not Null)
- `asset_type`: `VARCHAR(50)` (Enum: `'school'`, `'shelter'`, `'bridge'`, `'monument'`)
- `geometry`: `JSONB` (GeoJSON node structure)
- `latitude`: `DOUBLE PRECISION` (Not Null)
- `longitude`: `DOUBLE PRECISION` (Not Null)
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `now()`)

---

## 31. knowledge_base
Document segments for Retrieval-Augmented Generation.
- `id`: `UUID` (Primary Key, Default: `uuid_generate_v4()`)
- `title`: `VARCHAR(200)` (Not Null)
- `category`: `VARCHAR(50)` (Not Null) -- e.g. `'NDMA_Flood_SOP'`, `'Municipal_Fire_SOP'`
- `document_url`: `VARCHAR(512)`
- `content`: `TEXT` (Document text block)
- `embedding`: `VECTOR(1536)` (pgvector dimension size for embeddings)
- `source`: `VARCHAR(200)`
- `created_at`: `TIMESTAMPTZ` (Default: `now()`)
- *Index*: `idx_kb_embedding` ON `knowledge_base` USING `ivfflat` (or `hnsw`)

---

# Storage Buckets

Supabase Storage is partitioned into 4 access-restricted buckets:
- `incident-images`: Private write/public read. Stores images from reported tickets.
- `reports`: Restrictive access bucket. Stores daily/weekly operational PDF summaries.
- `documents`: Stores static SOP files referenced by the vector database.
- `avatars`: Public read/write. Stores user profile images.

---

# Realtime Table Configuration

PostgreSQL replication is configured to publish updates to WebSockets for:
- `incidents` (Live map updates & notifications)
- `notifications` (Instant alert banners)
- `sensor_data` (Live sensor chart lines)
- `ai_recommendations` (Live action plan updates)
- `vehicle_tracking` (Smooth movement animations)
- `weather_data` (Live weather banners)
