import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.models import (
    Role, State, District, City, Zone, Ward, Department,
    DigitalTwinNode, NodeConnection, Resource, Alert, TelemetryRecord
)

def seed_db(db: Session):
    print("Starting database seeding...")

    # 1. Seed Roles
    roles_data = [
        {"id": "147ac10b-58cc-4372-a567-0e02b2c3d401", "role_name": "citizen"},
        {"id": "147ac10b-58cc-4372-a567-0e02b2c3d402", "role_name": "officer"},
        {"id": "147ac10b-58cc-4372-a567-0e02b2c3d403", "role_name": "dept_head"},
        {"id": "147ac10b-58cc-4372-a567-0e02b2c3d404", "role_name": "admin"},
        {"id": "147ac10b-58cc-4372-a567-0e02b2c3d405", "role_name": "state_admin"},
        {"id": "147ac10b-58cc-4372-a567-0e02b2c3d406", "role_name": "national_admin"}
    ]
    for r in roles_data:
        role = db.query(Role).filter(Role.id == uuid.UUID(r["id"])).first()
        if not role:
            role = Role(id=uuid.UUID(r["id"]), role_name=r["role_name"])
            db.add(role)
            print(f"Seeded role: {r['role_name']}")

    # 2. Seed Departments
    depts_data = [
        {"id": "247ac10b-58cc-4372-a567-0e02b2c3d411", "name": "Police Department", "code": "POLICE"},
        {"id": "247ac10b-58cc-4372-a567-0e02b2c3d412", "name": "Fire Department", "code": "FIRE"},
        {"id": "247ac10b-58cc-4372-a567-0e02b2c3d413", "name": "Emergency Health Services", "code": "HEALTH"},
        {"id": "247ac10b-58cc-4372-a567-0e02b2c3d414", "name": "Municipal Corporation", "code": "MUNICIPAL"},
        {"id": "247ac10b-58cc-4372-a567-0e02b2c3d415", "name": "Disaster Management Authority", "code": "DISASTER"}
    ]
    for d in depts_data:
        dept = db.query(Department).filter(Department.id == uuid.UUID(d["id"])).first()
        if not dept:
            dept = Department(id=uuid.UUID(d["id"]), name=d["name"], code=d["code"], status="active")
            db.add(dept)
            print(f"Seeded department: {d['code']}")

    # 3. Seed State
    state_id = uuid.UUID("f47ac10b-58cc-4372-a567-0e02b2c3d479")
    state = db.query(State).filter(State.id == state_id).first()
    if not state:
        state = State(id=state_id, state_name="Andhra Pradesh", status="active")
        db.add(state)
        print("Seeded state: Andhra Pradesh")

    # 4. Seed District
    district_id = uuid.UUID("e47ac10b-58cc-4372-a567-0e02b2c3d480")
    district = db.query(District).filter(District.id == district_id).first()
    if not district:
        district = District(id=district_id, state_id=state_id, district_name="Visakhapatnam District", status="active")
        db.add(district)
        print("Seeded district: Visakhapatnam District")

    # 5. Seed City
    city_id = uuid.UUID("d47ac10b-58cc-4372-a567-0e02b2c3d481")
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        city = City(
            id=city_id,
            district_id=district_id,
            city_name="Visakhapatnam",
            population=2000000,
            latitude=17.6868,
            longitude=83.2185,
            status="active"
        )
        db.add(city)
        print("Seeded city: Visakhapatnam")

    # 6. Seed Zone
    zone_id = uuid.UUID("c47ac10b-58cc-4372-a567-0e02b2c3d482")
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        zone = Zone(
            id=zone_id,
            city_id=city_id,
            zone_name="Visakhapatnam Zone 1",
            polygon={
                "type": "Polygon",
                "coordinates": [[[83.1, 17.6], [83.3, 17.6], [83.3, 17.8], [83.1, 17.8], [83.1, 17.6]]]
            },
            risk_level="low"
        )
        db.add(zone)
        print("Seeded zone: Visakhapatnam Zone 1")

    # 7. Seed Ward
    ward_id = uuid.UUID("b47ac10b-58cc-4372-a567-0e02b2c3d483")
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if not ward:
        ward = Ward(id=ward_id, zone_id=zone_id, ward_name="Ward 12")
        db.add(ward)
        print("Seeded ward: Ward 12")

    # 8. Seed Digital Twin Nodes (Command center, sensors)
    nodes_data = [
        {
            "id": "a47ac10b-58cc-4372-a567-0e02b2c3d484",
            "name": "[SIMULATED] Visakhapatnam City Command Center",
            "type": "command_center",
            "level": "city",
            "status": "operational",
            "latitude": 17.6868,
            "longitude": 83.2185
        },
        {
            "id": "947ac10b-58cc-4372-a567-0e02b2c3d485",
            "name": "[SIMULATED] MVP Colony Police Station Node",
            "type": "police",
            "level": None,
            "status": "operational",
            "latitude": 17.7212,
            "longitude": 83.3142
        },
        {
            "id": "847ac10b-58cc-4372-a567-0e02b2c3d486",
            "name": "[SIMULATED] Beach Road Storm Drain Gauge",
            "type": "sensor",
            "level": None,
            "status": "warning",
            "latitude": 17.7112,
            "longitude": 83.3042,
            "last_telemetry": {"water_level": 4.15, "unit": "m"}
        },
        {
            "id": "e47ac10b-58cc-4372-a567-0e02b2c3d495",
            "name": "Vizag Weather & Air Quality Monitoring Station",
            "type": "weather",
            "level": None,
            "status": "normal",
            "latitude": 17.6868,
            "longitude": 83.2185,
            "last_telemetry": {"temperature": 28.0, "aqi": 50, "unit": "metric"}
        }
    ]
    for n in nodes_data:
        node = db.query(DigitalTwinNode).filter(DigitalTwinNode.id == uuid.UUID(n["id"])).first()
        if not node:
            node = DigitalTwinNode(
                id=uuid.UUID(n["id"]),
                state_id=state_id,
                city_id=city_id,
                name=n["name"],
                type=n["type"],
                level=n["level"],
                status=n["status"],
                latitude=n["latitude"],
                longitude=n["longitude"],
                last_telemetry=n.get("last_telemetry")
            )
            db.add(node)
            print(f"Seeded digital twin node: {n['name']}")

    # 9. Seed Node Connection
    conn_id = uuid.UUID("747ac10b-58cc-4372-a567-0e02b2c3d487")
    conn = db.query(NodeConnection).filter(NodeConnection.id == conn_id).first()
    if not conn:
        conn = NodeConnection(
            id=conn_id,
            from_node_id=uuid.UUID("947ac10b-58cc-4372-a567-0e02b2c3d485"), # Police outpost
            to_node_id=uuid.UUID("a47ac10b-58cc-4372-a567-0e02b2c3d484"), # Command center
            status="active",
            latency_ms=10
        )
        db.add(conn)
        print("Seeded node connection")

    # 10. Seed Resources
    resources_data = [
        {
            "id": "647ac10b-58cc-4372-a567-0e02b2c3d488",
            "name": "[SIMULATED] Ambulance AP-31-A-100",
            "type": "ambulance",
            "status": "available",
            "latitude": 17.6868,
            "longitude": 83.2185,
            "department_id": "247ac10b-58cc-4372-a567-0e02b2c3d413" # HEALTH
        },
        {
            "id": "547ac10b-58cc-4372-a567-0e02b2c3d489",
            "name": "[SIMULATED] Fire Truck AP-31-F-200",
            "type": "fire_truck",
            "status": "available",
            "latitude": 17.7212,
            "longitude": 83.3142,
            "department_id": "247ac10b-58cc-4372-a567-0e02b2c3d412" # FIRE
        }
    ]
    for r in resources_data:
        res = db.query(Resource).filter(Resource.id == uuid.UUID(r["id"])).first()
        if not res:
            res = Resource(
                id=uuid.UUID(r["id"]),
                name=r["name"],
                type=r["type"],
                status=r["status"],
                latitude=r["latitude"],
                longitude=r["longitude"],
                department_id=uuid.UUID(r["department_id"]),
                city_id=city_id
            )
            db.add(res)
            print(f"Seeded resource: {r['name']}")

    # 11. Seed Alert
    alert_id = uuid.UUID("447ac10b-58cc-4372-a567-0e02b2c3d490")
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        alert = Alert(
            id=alert_id,
            title="[SIMULATED] High Rainfall Warning",
            description="Heavy precipitation forecast for Visakhapatnam over next 24 hours.",
            severity="high",
            category="weather",
            state_id=state_id,
            city_id=city_id,
            source="system",
            status="active",
            expires_at=datetime.utcnow() + timedelta(days=1)
        )
        db.add(alert)
        print("Seeded alert: High Rainfall Warning")

    # 12. Seed Telemetry Record
    tel_id = uuid.UUID("347ac10b-58cc-4372-a567-0e02b2c3d491")
    telemetry = db.query(TelemetryRecord).filter(TelemetryRecord.id == tel_id).first()
    if not telemetry:
        telemetry = TelemetryRecord(
            id=tel_id,
            node_id=uuid.UUID("847ac10b-58cc-4372-a567-0e02b2c3d486"), # Drain gauge
            metric_type="water_level",
            value=4.15,
            unit="m",
            status="warning",
            timestamp=datetime.utcnow()
        )
        db.add(telemetry)
        print("Seeded telemetry record")

    db.commit()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
