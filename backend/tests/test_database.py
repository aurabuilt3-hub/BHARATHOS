import pytest
import uuid
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from app.db.session import engine
from app.models.models import (
    Base, State, District, City, Zone, Ward, Department,
    DigitalTwinNode, NodeConnection, Resource, Alert, TelemetryRecord
)

# Set up database session fixture with transactional rollback isolation
@pytest.fixture(scope="function")
def db():
    # Connect to the database
    connection = engine.connect()
    # Begin a non-ORM transaction
    transaction = connection.begin()
    # Bind a new session to the connection
    SessionLocal = sessionmaker(bind=connection)
    session = SessionLocal()

    yield session

    # Rollback the transaction and close connection to guarantee test isolation
    session.close()
    transaction.rollback()
    connection.close()

def test_create_state_and_city(db: Session):
    # Verify we can insert and query regional records
    state_id = uuid.uuid4()
    state = State(id=state_id, state_name=f"Test State {state_id}", status="active")
    db.add(state)
    db.flush()

    district_id = uuid.uuid4()
    district = District(id=district_id, state_id=state_id, district_name=f"Test District {district_id}", status="active")
    db.add(district)
    db.flush()

    city_id = uuid.uuid4()
    city = City(
        id=city_id,
        district_id=district_id,
        city_name="Test City",
        population=100000,
        latitude=12.3456,
        longitude=78.9101,
        status="active"
    )
    db.add(city)
    db.commit()

    # Query and assert values
    queried_city = db.query(City).filter(City.id == city_id).first()
    assert queried_city is not None
    assert queried_city.city_name == "Test City"
    assert queried_city.latitude == 12.3456
    assert queried_city.longitude == 78.9101
    assert queried_city.district.district_name.startswith("Test District")

def test_create_digital_twin_node(db: Session):
    # Retrieve the seeded state and city (or create test ones to keep tests self-contained)
    state = db.query(State).first()
    city = db.query(City).first()
    assert state is not None
    assert city is not None

    node_id = uuid.uuid4()
    node = DigitalTwinNode(
        id=node_id,
        state_id=state.id,
        city_id=city.id,
        name="Test Sensor Node",
        type="sensor",
        status="operational",
        latitude=17.7000,
        longitude=83.3000,
        last_telemetry={"aqi": 42}
    )
    db.add(node)
    db.commit()

    queried_node = db.query(DigitalTwinNode).filter(DigitalTwinNode.id == node_id).first()
    assert queried_node is not None
    assert queried_node.name == "Test Sensor Node"
    assert queried_node.type == "sensor"
    assert queried_node.last_telemetry == {"aqi": 42}

def test_create_node_connection(db: Session):
    state = db.query(State).first()
    city = db.query(City).first()

    node1 = DigitalTwinNode(
        id=uuid.uuid4(),
        state_id=state.id,
        city_id=city.id,
        name="Source Node",
        type="police",
        latitude=17.7000,
        longitude=83.3000
    )
    node2 = DigitalTwinNode(
        id=uuid.uuid4(),
        state_id=state.id,
        city_id=city.id,
        name="Destination Node",
        type="command_center",
        latitude=17.7100,
        longitude=83.3100
    )
    db.add_all([node1, node2])
    db.flush()

    connection_id = uuid.uuid4()
    conn = NodeConnection(
        id=connection_id,
        from_node_id=node1.id,
        to_node_id=node2.id,
        status="active",
        latency_ms=12
    )
    db.add(conn)
    db.commit()

    queried_conn = db.query(NodeConnection).filter(NodeConnection.id == connection_id).first()
    assert queried_conn is not None
    assert queried_conn.status == "active"
    assert queried_conn.latency_ms == 12
    assert queried_conn.from_node.name == "Source Node"
    assert queried_conn.to_node.name == "Destination Node"

def test_create_resource(db: Session):
    city = db.query(City).first()
    dept = db.query(Department).first()
    assert city is not None
    assert dept is not None

    res_id = uuid.uuid4()
    resource = Resource(
        id=res_id,
        name="Test Fire Engine 1",
        type="fire_truck",
        status="available",
        latitude=17.7200,
        longitude=83.3200,
        department_id=dept.id,
        city_id=city.id
    )
    db.add(resource)
    db.commit()

    queried_res = db.query(Resource).filter(Resource.id == res_id).first()
    assert queried_res is not None
    assert queried_res.name == "Test Fire Engine 1"
    assert queried_res.type == "fire_truck"
    assert queried_res.status == "available"
    assert queried_res.department.id == dept.id

def test_create_alert(db: Session):
    state = db.query(State).first()
    city = db.query(City).first()

    alert_id = uuid.uuid4()
    alert = Alert(
        id=alert_id,
        title="Cyclone Alert",
        description="High intensity cyclone expected near coast.",
        severity="critical",
        category="disaster",
        state_id=state.id,
        city_id=city.id,
        source="meteorological_dept",
        status="active"
    )
    db.add(alert)
    db.commit()

    queried_alert = db.query(Alert).filter(Alert.id == alert_id).first()
    assert queried_alert is not None
    assert queried_alert.title == "Cyclone Alert"
    assert queried_alert.severity == "critical"
    assert queried_alert.status == "active"

def test_create_telemetry_record(db: Session):
    node = db.query(DigitalTwinNode).first()
    assert node is not None

    record_id = uuid.uuid4()
    record = TelemetryRecord(
        id=record_id,
        node_id=node.id,
        metric_type="temperature",
        value=36.7,
        unit="C",
        status="normal"
    )
    db.add(record)
    db.commit()

    queried_record = db.query(TelemetryRecord).filter(TelemetryRecord.id == record_id).first()
    assert queried_record is not None
    assert queried_record.metric_type == "temperature"
    assert queried_record.value == 36.7
    assert queried_record.node.id == node.id
