import pytest
import uuid
import json
from datetime import datetime, timedelta, UTC
from unittest.mock import patch, MagicMock
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.main import app
from app.db.session import engine, get_db
from app.models.models import User, Role, State, District, City, Alert, TelemetryRecord, DigitalTwinNode, AuditLog
from app.services.alert_service import AlertService
from app.services.alert_rule_service import AlertRuleService

client = TestClient(app)

# Helper mock structures for Supabase Auth
class MockUserObj:
    def __init__(self, id_str, email):
        self.id = id_str
        self.email = email

class MockUserResponse:
    def __init__(self, user_obj):
        self.user = user_obj

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    SessionLocal = Session(bind=connection)
    
    yield SessionLocal
    
    SessionLocal.close()
    if transaction.is_active:
        transaction.rollback()
    connection.close()

@pytest.fixture(autouse=True)
def override_db(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    yield
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture
def setup_test_data(db_session):
    # Ensure roles exist
    roles = {}
    for role_name in ("citizen", "dept_head", "admin"):
        r = db_session.query(Role).filter(Role.role_name == role_name).first()
        if not r:
            r = Role(id=uuid.uuid4(), role_name=role_name)
            db_session.add(r)
        roles[role_name] = r
    db_session.flush()

    # Geography Setup
    state_ap = db_session.query(State).filter_by(state_name="Andhra Pradesh").first()
    if not state_ap:
        state_ap = State(id=uuid.uuid4(), state_name="Andhra Pradesh", status="active")
        db_session.add(state_ap)
        db_session.flush()

    dist_vizag = db_session.query(District).filter_by(district_name="Visakhapatnam District").first()
    if not dist_vizag:
        dist_vizag = District(id=uuid.uuid4(), state_id=state_ap.id, district_name="Visakhapatnam District", status="active")
        db_session.add(dist_vizag)
        db_session.flush()

    city_vizag = db_session.query(City).filter_by(city_name="Visakhapatnam").first()
    if not city_vizag:
        city_vizag = City(
            id=uuid.uuid4(),
            district_id=dist_vizag.id,
            city_name="Visakhapatnam",
            population=1500000,
            latitude=17.68,
            longitude=83.21,
            status="active"
        )
        db_session.add(city_vizag)
        db_session.flush()

    # Create another city for scope boundary checks
    city_out = db_session.query(City).filter_by(city_name="Out of Scope City").first()
    if not city_out:
        city_out = City(
            id=uuid.uuid4(),
            district_id=dist_vizag.id,
            city_name="Out of Scope City",
            population=50000,
            latitude=17.99,
            longitude=83.99,
            status="active"
        )
        db_session.add(city_out)
        db_session.flush()

    citizen_user = User(
        id=uuid.uuid4(),
        full_name="Citizen User",
        email="citizen@test.com",
        role_id=roles["citizen"].id,
        status="active"
    )
    db_session.add(citizen_user)

    dept_head_user = User(
        id=uuid.uuid4(),
        full_name="Dept Head User",
        email="depthead@test.com",
        role_id=roles["dept_head"].id,
        city_id=city_vizag.id,  # Scoped to Visakhapatnam City
        status="active"
    )
    db_session.add(dept_head_user)

    admin_user = User(
        id=uuid.uuid4(),
        full_name="Admin User",
        email="admin@test.com",
        role_id=roles["admin"].id,
        status="active"
    )
    db_session.add(admin_user)

    db_session.commit()

    return {
        "roles": roles,
        "state": state_ap,
        "district": dist_vizag,
        "city": city_vizag,
        "city_out": city_out,
        "citizen": citizen_user,
        "dept_head": dept_head_user,
        "admin": admin_user,
    }


def test_missing_authentication_and_invalid_token(setup_test_data):
    # Test 8: missing authentication
    resp = client.get("/api/v1/alerts")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    # Test 9: invalid token (raises 401 via supabase error or bearer format)
    # The default mock handles token validation check
    resp = client.get("/api/v1/alerts", headers={"Authorization": "Bearer invalid_token"})
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_alert_lifecycle_and_rbac(mock_get_user, db_session, setup_test_data):
    # Test 12: unauthorized alert creation (Citizen trying to POST -> 403)
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_test_data["citizen"].id), setup_test_data["citizen"].email))
    auth_headers_citizen = {"Authorization": "Bearer citizen"}
    
    payload = {
        "title": "Unauthorized Alert",
        "description": "This should fail",
        "severity": "HIGH",
        "category": "FIRE",
        "state_id": str(setup_test_data["state"].id),
        "city_id": str(setup_test_data["city"].id)
    }
    resp = client.post("/api/v1/alerts", json=payload, headers=auth_headers_citizen)
    assert resp.status_code == status.HTTP_403_FORBIDDEN

    # Test 11: authorized alert creation (Admin posting)
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_test_data["admin"].id), setup_test_data["admin"].email))
    auth_headers_admin = {"Authorization": "Bearer admin"}
    
    resp = client.post("/api/v1/alerts", json=payload, headers=auth_headers_admin)
    assert resp.status_code == status.HTTP_201_CREATED
    alert_id = resp.json()["id"]

    # Verify Simulated classification (Test 22)
    assert resp.json()["source"] == "SIMULATED"

    # Verify audit logging was generated (Test 17)
    audit = db_session.query(AuditLog).filter_by(record_id=uuid.UUID(alert_id), action="ALERT_CREATED").first()
    assert audit is not None
    assert audit.table_name == "alerts"

    # Test 13: Acknowledge Transition (ACTIVE -> ACKNOWLEDGED)
    resp = client.patch(f"/api/v1/alerts/{alert_id}/acknowledge", headers=auth_headers_admin)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["status"] == "ACKNOWLEDGED"

    # Verify audit log for acknowledge
    assert db_session.query(AuditLog).filter_by(record_id=uuid.UUID(alert_id), action="ALERT_ACKNOWLEDGED").count() == 1

    # Test 14: Invalid acknowledge transition (cannot acknowledge since it's already ACKNOWLEDGED)
    resp = client.patch(f"/api/v1/alerts/{alert_id}/acknowledge", headers=auth_headers_admin)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST

    # Test 15: Resolve Transition (ACKNOWLEDGED -> RESOLVED)
    resp = client.patch(f"/api/v1/alerts/{alert_id}/resolve", headers=auth_headers_admin)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["status"] == "RESOLVED"

    # Verify audit log for resolve
    assert db_session.query(AuditLog).filter_by(record_id=uuid.UUID(alert_id), action="ALERT_RESOLVED").count() == 1

    # Test 16: Invalid resolve transition (cannot resolve since it's already RESOLVED)
    resp = client.patch(f"/api/v1/alerts/{alert_id}/resolve", headers=auth_headers_admin)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST


@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_alert_query_filtering_and_geography(mock_get_user, db_session, setup_test_data):
    db_session.query(Alert).delete()
    # Seed 3 Alerts in different categories/severities/geographies
    # 1. Vizag City Alert
    alert1 = Alert(
        id=uuid.uuid4(),
        title="Vizag Weather",
        description="Vizag Weather Alert",
        severity="HIGH",
        category="WEATHER",
        state_id=setup_test_data["state"].id,
        city_id=setup_test_data["city"].id,
        source="SIMULATED",
        status="ACTIVE"
    )
    # 2. Out of scope city Alert
    alert2 = Alert(
        id=uuid.uuid4(),
        title="Out of Scope Weather",
        description="Out of Scope Alert",
        severity="LOW",
        category="WEATHER",
        state_id=setup_test_data["state"].id,
        city_id=setup_test_data["city_out"].id,
        source="SIMULATED",
        status="ACTIVE"
    )
    # 3. Vizag Fire Alert
    alert3 = Alert(
        id=uuid.uuid4(),
        title="Vizag Fire",
        description="Vizag Fire Alert",
        severity="CRITICAL",
        category="FIRE",
        state_id=setup_test_data["state"].id,
        city_id=setup_test_data["city"].id,
        source="SIMULATED",
        status="RESOLVED"
    )
    db_session.add_all([alert1, alert2, alert3])
    db_session.commit()

    # Authenticate as dept_head (scoped to Vizag City)
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_test_data["dept_head"].id), setup_test_data["dept_head"].email))
    auth_headers_scoped = {"Authorization": "Bearer dept_head"}

    # Test 10: Out of scope access (getting out of scope alert detail -> 403)
    resp = client.get(f"/api/v1/alerts/{alert2.id}", headers=auth_headers_scoped)
    assert resp.status_code == status.HTTP_403_FORBIDDEN

    # Scoped get detail of in-scope alert -> 200
    resp = client.get(f"/api/v1/alerts/{alert1.id}", headers=auth_headers_scoped)
    assert resp.status_code == status.HTTP_200_OK

    # Test 1: List alerts & Test 3: Pagination
    resp = client.get("/api/v1/alerts?page=1&limit=2", headers=auth_headers_scoped)
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    # Should only return alerts scoped to Vizag (alert1 & alert3)
    assert len(data["items"]) == 2

    # Test 4: Severity filtering
    resp = client.get("/api/v1/alerts?severity=CRITICAL", headers=auth_headers_scoped)
    assert len(resp.json()["items"]) == 1
    assert resp.json()["items"][0]["title"] == "Vizag Fire"

    # Test 5: Status filtering
    resp = client.get("/api/v1/alerts?status=ACTIVE", headers=auth_headers_scoped)
    assert len(resp.json()["items"]) == 1
    assert resp.json()["items"][0]["title"] == "Vizag Weather"

    # Test 6: Type/category filtering
    resp = client.get("/api/v1/alerts?alert_type=FIRE", headers=auth_headers_scoped)
    assert len(resp.json()["items"]) == 1

    # Test 7: Geography filtering (trying to filter outside Vizag -> 403)
    resp = client.get(f"/api/v1/alerts?city_id={setup_test_data['city_out'].id}", headers=auth_headers_scoped)
    assert resp.status_code == status.HTTP_403_FORBIDDEN

    # Test 18: Summary Aggregation
    resp = client.get("/api/v1/alerts/summary", headers=auth_headers_scoped)
    assert resp.status_code == status.HTTP_200_OK
    summary = resp.json()
    assert summary["total"] == 2
    assert summary["active"] == 1
    assert summary["resolved"] == 1
    assert summary["critical"] == 1
    assert summary["high"] == 1


@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_expired_alert_handling(mock_get_user, db_session, setup_test_data):
    # Seed an expired alert (ACTIVE but expires_at in the past)
    expired_alert = Alert(
        id=uuid.uuid4(),
        title="Old Alert",
        description="This was an alert",
        severity="MEDIUM",
        category="OTHER",
        state_id=setup_test_data["state"].id,
        city_id=setup_test_data["city"].id,
        source="SIMULATED",
        status="ACTIVE",
        expires_at=datetime.utcnow() - timedelta(minutes=10)
    )
    db_session.add(expired_alert)
    db_session.commit()

    # Authenticate as admin
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_test_data["admin"].id), setup_test_data["admin"].email))
    auth_headers_admin = {"Authorization": "Bearer admin"}

    # Trigger list or get or summary which calls expire_alerts
    resp = client.get("/api/v1/alerts/summary", headers=auth_headers_admin)
    
    # Reload and assert status updated to EXPIRED
    db_session.refresh(expired_alert)
    assert expired_alert.status == "EXPIRED"

    # Verify audit log for expiration
    assert db_session.query(AuditLog).filter_by(record_id=expired_alert.id, action="ALERT_EXPIRED").count() == 1


def test_telemetry_rule_evaluation_and_deduplication(db_session, setup_test_data):
    # Setup digital twin node for sensor
    node = DigitalTwinNode(
        id=uuid.uuid4(),
        state_id=setup_test_data["state"].id,
        city_id=setup_test_data["city"].id,
        name="Drain sensor #4",
        type="infrastructure",
        latitude=17.7,
        longitude=83.3,
        status="operational"
    )
    db_session.add(node)
    db_session.commit()

    # Seed warning telemetry
    telemetry = TelemetryRecord(
        id=uuid.uuid4(),
        node_id=node.id,
        metric_type="water_level",
        value=4.6,  # > 4.5 critical threshold
        unit="m",
        status="warning",
        timestamp=datetime.utcnow()
    )
    db_session.add(telemetry)
    db_session.commit()

    # Test 21: Telemetry rule evaluation
    alert = AlertRuleService.evaluate_telemetry(db_session, telemetry)
    assert alert is not None
    assert "Critical Flooding Alert" in alert.title
    assert alert.severity == "CRITICAL"
    assert alert.status == "ACTIVE"

    # Test 20: Duplicate alert prevention
    # Run evaluation again with the same telemetry breach
    alert_dup = AlertRuleService.evaluate_telemetry(db_session, telemetry)
    assert alert_dup.id == alert.id  # Matches and updates existing instead of inserting another one
