import uuid
from sqlalchemy.orm import Session
from app.db.session import engine
from app.models.models import User, Role, State, District, City, DigitalTwinNode, TelemetryRecord
from app.dependencies.auth import verify_geographic_scope

connection = engine.connect()
transaction = connection.begin()
db = Session(bind=connection)

try:
    # 1. Setup role, state, city
    role = db.query(Role).filter_by(role_name="district_operator").first()
    if not role:
        role = Role(id=uuid.uuid4(), role_name="district_operator")
        db.add(role)
    
    state = db.query(State).filter_by(state_name="Andhra Pradesh").first()
    if not state:
        state = State(id=uuid.uuid4(), state_name="Andhra Pradesh", status="active")
        db.add(state)
        
    dist = db.query(District).filter_by(district_name="Visakhapatnam District").first()
    if not dist:
        dist = District(id=uuid.uuid4(), state_id=state.id, district_name="Visakhapatnam District", status="active")
        db.add(dist)

    city = db.query(City).filter_by(city_name="Visakhapatnam").first()
    if not city:
        city = City(id=uuid.uuid4(), district_id=dist.id, city_name="Visakhapatnam", status="active")
        db.add(city)
    
    db.flush()

    user = User(
        id=uuid.uuid4(),
        full_name="Provenance User",
        email=f"debug_{uuid.uuid4()}@bharatos.gov.in",
        role=role,
        state=state,
        city=city,
        status="active"
    )
    db.add(user)
    db.flush()

    node_iot = DigitalTwinNode(
        id=uuid.uuid4(),
        state=state,
        city=city,
        name="Ward 12 Storm Drain Gauge",
        type="sensor",
        status="active",
        latitude=17.68,
        longitude=83.21,
        last_telemetry={"source_type": "REAL_IOT"}
    )
    db.add(node_iot)
    db.flush()

    rec_iot = TelemetryRecord(
        id=uuid.uuid4(),
        node=node_iot,
        metric_type="water_level",
        value=150.0,
        unit="cm",
        status="critical"
    )
    db.add(rec_iot)
    db.flush()

    print("Checking database records...")
    records = list(db.query(TelemetryRecord).all())
    print(f"Total telemetry records found: {len(records)}")
    for r in records:
        print(f"Record node: {r.node}")
        if r.node:
            print(f"Record node state_id: {r.node.state_id}, user state_id: {user.state_id}")
            print(f"Record node city_id: {r.node.city_id}, user city_id: {user.city_id}")
            scope_ok = verify_geographic_scope(user, r.node.state_id, None, r.node.city_id, db)
            print(f"verify_geographic_scope: {scope_ok}")

finally:
    db.close()
    transaction.rollback()
    connection.close()
