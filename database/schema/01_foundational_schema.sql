-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. states Table
CREATE TABLE IF NOT EXISTS states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_name VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_states_modtime 
    BEFORE UPDATE ON states 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. districts Table
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    district_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_districts_modtime 
    BEFORE UPDATE ON districts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. cities Table
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    city_name VARCHAR(100) NOT NULL,
    population INTEGER,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_cities_modtime 
    BEFORE UPDATE ON cities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. zones Table
CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    zone_name VARCHAR(100) NOT NULL,
    polygon JSONB NOT NULL, -- GeoJSON representation of zone boundary
    risk_level VARCHAR(20) DEFAULT 'low',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_zones_modtime 
    BEFORE UPDATE ON zones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. wards Table
CREATE TABLE IF NOT EXISTS wards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    ward_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_wards_modtime 
    BEFORE UPDATE ON wards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- Seed lookup roles
INSERT INTO roles (role_name) VALUES 
('citizen'),
('officer'),
('dept_head'),
('admin'),
('state_admin'),
('national_admin')
ON CONFLICT (role_name) DO NOTHING;

-- 7. departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g. POLICE, FIRE, HEALTH, MUNICIPAL, DISASTER
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_departments_modtime 
    BEFORE UPDATE ON departments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed core departments
INSERT INTO departments (name, code) VALUES
('Police Department', 'POLICE'),
('Fire Department', 'FIRE'),
('Emergency Health Services', 'HEALTH'),
('Municipal Corporation', 'MUNICIPAL'),
('Disaster Management Authority', 'DISASTER')
ON CONFLICT (code) DO NOTHING;

-- 8. users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY, -- Matches auth.users.id from Supabase Auth
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role_id UUID NOT NULL REFERENCES roles(id),
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_users_modtime 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. officers Table (linking officers to departments)
CREATE TABLE IF NOT EXISTS officers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    designation VARCHAR(100),
    station VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_officers_modtime 
    BEFORE UPDATE ON officers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. audit_logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- CREATE INDEXES FOR PERFORMANCE Optimization
CREATE INDEX IF NOT EXISTS idx_districts_state ON districts(state_id);
CREATE INDEX IF NOT EXISTS idx_cities_district ON cities(district_id);
CREATE INDEX IF NOT EXISTS idx_zones_city ON zones(city_id);
CREATE INDEX IF NOT EXISTS idx_wards_zone ON wards(zone_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city_id);
CREATE INDEX IF NOT EXISTS idx_officers_user ON officers(user_id);
CREATE INDEX IF NOT EXISTS idx_officers_department ON officers(department_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_action ON audit_logs(user_id, action);
