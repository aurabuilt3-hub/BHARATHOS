-- 1. Create Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    citizen_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL, -- Flood, Fire, Medical, Accident, Garbage, Water Leakage, Pothole, Street Light Failure, Fallen Tree, Infrastructure Damage
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    severity VARCHAR(20) DEFAULT 'medium', -- critical, high, medium, low
    status VARCHAR(20) DEFAULT 'active', -- active, assigned, in_progress, resolved, closed
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    ward_id UUID REFERENCES wards(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_incidents_modtime 
    BEFORE UPDATE ON incidents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Create Incident Images Table
CREATE TABLE IF NOT EXISTS incident_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Incident Assignments Table
CREATE TABLE IF NOT EXISTS incident_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    assigned_officer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'assigned', -- assigned, acknowledged, completed, rejected
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_incident_assignments_modtime 
    BEFORE UPDATE ON incident_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for Incident Query Optimization
CREATE INDEX IF NOT EXISTS idx_incidents_ticket ON incidents(ticket_number);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_coords ON incidents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_incidents_zone ON incidents(zone_id);
CREATE INDEX IF NOT EXISTS idx_incidents_dept ON incidents(department_id);
CREATE INDEX IF NOT EXISTS idx_incident_assign_inc ON incident_assignments(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_assign_off ON incident_assignments(assigned_officer_id);
