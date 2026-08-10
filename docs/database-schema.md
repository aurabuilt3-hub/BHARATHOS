# BharatOS PostgreSQL / Supabase Database Schema Specification

This document details the relational database schema, tables, columns, relations, and indexing strategy for the **BharatOS** platform.

---

## 1. Relational Entity Diagram Overview

The relational structure of the system is divided into three key sub-systems:
1. **Geographic Hierarchy**: `states` → `districts` → `cities` → `zones` → `wards`.
2. **Municipal & Operations Org**: `roles`, `departments`, `users`, `officers`, `audit_logs`.
3. **Incidents & Telemetry Operations**: `incidents`, `incident_images`, `incident_assignments`, `digital_twin_nodes`, `node_connections`.

---

## 2. Table Specifications

### 2.1. Geographic Hierarchy Tables

#### 1. `states`
- **Purpose**: Tracks national state-level jurisdictions.
- **Columns**:
  - `id` (UUID, Primary Key, Default `uuid_generate_v4()`)
  - `state_name` (VARCHAR(100), Unique, Not Null)
  - `status` (VARCHAR(20), Default `'active'`)
  - `created_at` (TIMESTAMPTZ, Default `now()`)
  - `updated_at` (TIMESTAMPTZ, Default `now()`)

#### 2. `districts`
- **Purpose**: Represents regional districts within a state.
- **Columns**:
  - `id` (UUID, Primary Key, Default `uuid_generate_v4()`)
  - `state_id` (UUID, Foreign Key referencing `states.id` ON DELETE CASCADE, Not Null)
  - `district_name` (VARCHAR(100), Not Null)
  - `status` (VARCHAR(20), Default `'active'`)
  - `created_at` / `updated_at` (TIMESTAMPTZ)
- **Indexes**: `idx_districts_state` on `state_id`

#### 3. `cities`
- **Purpose**: Municipal city boundaries and telemetry benchmarks.
- **Columns**:
  - `id` (UUID, Primary Key, Default `uuid_generate_v4()`)
  - `district_id` (UUID, Foreign Key referencing `districts.id` ON DELETE CASCADE, Not Null)
  - `city_name` (VARCHAR(100), Not Null)
  - `population` (INTEGER)
  - `latitude` / `longitude` (DOUBLE PRECISION, Not Null)
  - `status` (VARCHAR(20), Default `'active'`)
  - `created_at` / `updated_at` (TIMESTAMPTZ)
- **Indexes**: `idx_cities_district` on `district_id`

#### 4. `zones`
- **Purpose**: City zoning partitions for risk and incident indexing.
- **Columns**:
  - `id` (UUID, Primary Key, Default `uuid_generate_v4()`)
  - `city_id` (UUID, Foreign Key referencing `cities.id` ON DELETE CASCADE, Not Null)
  - `zone_name` (VARCHAR(100), Not Null)
  - `polygon` (JSONB, Not Null) -- GeoJSON boundary representation
  - `risk_level` (VARCHAR(20), Default `'low'`) -- 'low', 'medium', 'high', 'critical'
  - `created_at` / `updated_at` (TIMESTAMPTZ)

#### 5. `wards`
- **Purpose**: Micro-municipal boundaries (e.g. Ward 12).
- **Columns**:
  - `id` (UUID, Primary Key, Default `uuid_generate_v4()`)
  - `zone_id` (UUID, Foreign Key referencing `zones.id` ON DELETE CASCADE, Not Null)
  - `ward_name` (VARCHAR(100), Not Null)
  - `created_at` / `updated_at` (TIMESTAMPTZ)

---

### 2.2. Municipal & Administrative Org Tables

#### 6. `roles`
- **Purpose**: System security roles definition.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `role_name` (VARCHAR(50), Unique, Not Null) -- 'citizen', 'officer', 'dept_head', 'admin', 'state_admin', 'national_admin'

#### 7. `departments`
- **Purpose**: Seeded municipal emergency responder divisions.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `name` (VARCHAR(100), Unique, Not Null)
  - `code` (VARCHAR(20), Unique, Not Null) -- e.g. POLICE, FIRE, HEALTH, MUNICIPAL, DISASTER
  - `status` (VARCHAR(20), Default `'active'`)

#### 8. `users`
- **Purpose**: User master profiles (integrates with Supabase Auth ID).
- **Columns**:
  - `id` (UUID, Primary Key) -- Matches Supabase `auth.users.id`
  - `full_name` (VARCHAR(150), Not Null)
  - `email` (VARCHAR(255), Unique, Not Null)
  - `phone` (VARCHAR(20))
  - `role_id` (UUID, Foreign Key referencing `roles.id`, Not Null)
  - `city_id` (UUID, Foreign Key referencing `cities.id` ON DELETE SET NULL)
  - `status` (VARCHAR(20), Default `'active'`)
  - `created_at` / `updated_at` (TIMESTAMPTZ)

#### 9. `officers`
- **Purpose**: Bridges municipal department allocations for operational personnel.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key referencing `users.id` ON DELETE CASCADE, Not Null)
  - `department_id` (UUID, Foreign Key referencing `departments.id` ON DELETE RESTRICT, Not Null)
  - `designation` (VARCHAR(100))
  - `station` (VARCHAR(150))
  - `created_at` / `updated_at` (TIMESTAMPTZ)

---

### 2.3. Incident Operations & Digital Twin Telemetry

#### 10. `incidents`
- **Purpose**: Core reports pipeline filed by citizens or AI diagnostics.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `ticket_number` (VARCHAR(50), Unique, Not Null) -- e.g. BHR-2026-00042
  - `citizen_id` (UUID, Foreign Key referencing `users.id` ON DELETE SET NULL)
  - `category` (VARCHAR(50), Not Null) -- e.g. 'Flood', 'Fire', 'Medical', 'Hazard'
  - `title` (VARCHAR(255), Not Null)
  - `description` (TEXT, Not Null)
  - `latitude` / `longitude` (DOUBLE PRECISION, Not Null)
  - `address` (TEXT)
  - `severity` (VARCHAR(20), Default `'medium'`) -- 'low', 'medium', 'high', 'critical'
  - `status` (VARCHAR(20), Default `'active'`) -- 'active', 'assigned', 'in_progress', 'resolved', 'closed'
  - `zone_id` (UUID, Foreign Key referencing `zones.id` ON DELETE SET NULL)
  - `ward_id` (UUID, Foreign Key referencing `wards.id` ON DELETE SET NULL)
  - `department_id` (UUID, Foreign Key referencing `departments.id` ON DELETE SET NULL)
  - `created_at` / `updated_at` (TIMESTAMPTZ)

#### 11. `digital_twin_nodes`
- **Purpose**: Telemetry nodes representing physical sensors or command systems.
- **Columns**:
  - `id` (UUID, Primary key, Default `uuid_generate_v4()`)
  - `state_id` (UUID, Foreign Key referencing `states.id` ON DELETE CASCADE, Not Null)
  - `city_id` (UUID, Foreign Key referencing `cities.id` ON DELETE SET NULL)
  - `name` (VARCHAR(150), Not Null) -- e.g. Delhi Command Hub, Ward 12 Drain
  - `type` (VARCHAR(30), Not Null) -- e.g. 'command_center', 'sensor', 'traffic_junction'
  - `status` (VARCHAR(20), Default `'operational'`) -- 'operational', 'warning', 'incident'
  - `latitude` / `longitude` (DOUBLE PRECISION, Not Null)
  - `last_telemetry` (JSONB) -- Stores latest reading parameters
  - `created_at` / `updated_at` (TIMESTAMPTZ)

#### 12. `node_connections`
- **Purpose**: Physical/network link lines drawn between command hubs in the digital twin map.
- **Columns**:
  - `id` (UUID, Primary Key, Default `uuid_generate_v4()`)
  - `from_node_id` (UUID, Foreign Key referencing `digital_twin_nodes.id` ON DELETE CASCADE, Not Null)
  - `to_node_id` (UUID, Foreign Key referencing `digital_twin_nodes.id` ON DELETE CASCADE, Not Null)
  - `status` (VARCHAR(20), Default `'active'`) -- 'active', 'degraded', 'offline'
  - `latency_ms` (INTEGER, Default 5)
  - `created_at` / `updated_at` (TIMESTAMPTZ)

#### 13. `facilities`
- **Purpose**: Represents fixed real-world/public emergency response infrastructure (e.g. police stations, hospitals, fire stations).
- **Difference from Resources**: Facilities are static physical infrastructure; Resources are mobile, deployable units (e.g. vehicles, teams).
- **Columns**:
  - `id` (UUID, Primary Key, Default `uuid_generate_v4()`)
  - `name` (VARCHAR(150), Not Null)
  - `facility_type` (VARCHAR(50), Not Null) -- e.g. 'POLICE_STATION', 'FIRE_STATION', 'HOSPITAL', 'AMBULANCE_BASE', 'EMERGENCY_FACILITY', 'OTHER'
  - `address` (TEXT)
  - `phone` (VARCHAR(50))
  - `latitude` / `longitude` (DOUBLE PRECISION, Not Null)
  - `state_id` (UUID, Foreign Key referencing `states.id` ON DELETE SET NULL)
  - `district_id` (UUID, Foreign Key referencing `districts.id` ON DELETE SET NULL)
  - `city_id` (UUID, Foreign Key referencing `cities.id` ON DELETE SET NULL)
  - `zone_id` (UUID, Foreign Key referencing `zones.id` ON DELETE SET NULL)
  - `ward_id` (UUID, Foreign Key referencing `wards.id` ON DELETE SET NULL)
  - `source_type` (VARCHAR(50), Not Null) -- e.g. 'OFFICIAL_PUBLIC', 'OPEN_DATA', 'VERIFIED_PUBLIC', 'SIMULATED'
  - `source_name` (VARCHAR(150))
  - `source_url` (VARCHAR(255))
  - `verified_at` (TIMESTAMPTZ)
  - `extra_data` (JSONB)
  - `created_at` / `updated_at` (TIMESTAMPTZ)
- **Indexes**: `ix_facilities_state_id`, `ix_facilities_district_id`, `ix_facilities_city_id`, `ix_facilities_zone_id`, `ix_facilities_ward_id`

