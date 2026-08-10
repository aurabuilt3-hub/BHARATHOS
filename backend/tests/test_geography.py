import pytest
import uuid
from fastapi import status
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import engine, get_db
from app.dependencies.auth import get_supabase_user, get_current_user
from app.models.models import User, Role, State, District, City, Zone, Ward

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    SessionLocal = Session(bind=connection)
    
    yield SessionLocal
    
    SessionLocal.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(autouse=True)
def override_db(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    yield
    app.dependency_overrides.pop(get_db, None)

# Helper mock structures for Supabase Auth
class MockUserObj:
    def __init__(self, id_str, email):
        self.id = id_str
        self.email = email

class MockUserResponse:
    def __init__(self, user_obj):
        self.user = user_obj

@pytest.fixture
def geo_data(db_session):
    # Setup geographic hierarchy
    # 1. State AP
    state_ap = State(id=uuid.uuid4(), state_name="Andhra Pradesh Test", status="active")
    db_session.add(state_ap)
    db_session.flush()

    # 2. State TS
    state_ts = State(id=uuid.uuid4(), state_name="Telangana Test", status="active")
    db_session.add(state_ts)
    db_session.flush()

    # 3. District Vizag in AP
    dist_vizag = District(id=uuid.uuid4(), state_id=state_ap.id, district_name="Visakhapatnam District Test", status="active")
    db_session.add(dist_vizag)
    db_session.flush()

    # 4. District Hyd in TS
    dist_hyd = District(id=uuid.uuid4(), state_id=state_ts.id, district_name="Hyderabad District Test", status="active")
    db_session.add(dist_hyd)
    db_session.flush()

    # 5. City Vizag in Vizag District
    city_vizag = City(
        id=uuid.uuid4(),
        district_id=dist_vizag.id,
        city_name="Visakhapatnam City Test",
        population=1500000,
        latitude=17.68,
        longitude=83.21,
        status="active"
    )
    db_session.add(city_vizag)
    db_session.flush()

    # 6. City Hyd in Hyd District
    city_hyd = City(
        id=uuid.uuid4(),
        district_id=dist_hyd.id,
        city_name="Hyderabad City Test",
        population=8000000,
        latitude=17.38,
        longitude=78.48,
        status="active"
    )
    db_session.add(city_hyd)
    db_session.flush()

    # 7. Zone 1 in Vizag City
    zone_vizag = Zone(
        id=uuid.uuid4(),
        city_id=city_vizag.id,
        zone_name="Vizag Zone One Test",
        polygon={"type": "Polygon", "coordinates": []},
        risk_level="low"
    )
    db_session.add(zone_vizag)
    db_session.flush()

    # 8. Ward A in Zone 1
    ward_vizag = Ward(
        id=uuid.uuid4(),
        zone_id=zone_vizag.id,
        ward_name="Vizag Ward A Test"
    )
    db_session.add(ward_vizag)
    db_session.flush()

    # Roles setup
    citizen_role = db_session.query(Role).filter(Role.role_name == "citizen").first()
    if not citizen_role:
        citizen_role = Role(id=uuid.uuid4(), role_name="citizen")
        db_session.add(citizen_role)

    admin_role = db_session.query(Role).filter(Role.role_name == "admin").first()
    if not admin_role:
        admin_role = Role(id=uuid.uuid4(), role_name="admin")
        db_session.add(admin_role)

    state_op_role = db_session.query(Role).filter(Role.role_name == "state_operator").first()
    if not state_op_role:
        state_op_role = Role(id=uuid.uuid4(), role_name="state_operator")
        db_session.add(state_op_role)

    city_op_role = db_session.query(Role).filter(Role.role_name == "city_operator").first()
    if not city_op_role:
        city_op_role = Role(id=uuid.uuid4(), role_name="city_operator")
        db_session.add(city_op_role)

    db_session.flush()

    return {
        "state_ap": state_ap,
        "state_ts": state_ts,
        "dist_vizag": dist_vizag,
        "dist_hyd": dist_hyd,
        "city_vizag": city_vizag,
        "city_hyd": city_hyd,
        "zone_vizag": zone_vizag,
        "ward_vizag": ward_vizag,
        "citizen_role": citizen_role,
        "admin_role": admin_role,
        "state_op_role": state_op_role,
        "city_op_role": city_op_role
    }

# 1. State list
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_states_list(mock_get_user, db_session, geo_data):
    user_id = str(uuid.uuid4())
    citizen = User(id=uuid.UUID(user_id), full_name="Citizen Tester", email="c@test.com", role_id=geo_data["citizen_role"].id, status="active")
    db_session.add(citizen)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "c@test.com"))

    response = client.get("/api/v1/states", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 2
    state_names = [s["state_name"] for s in data]
    assert "Andhra Pradesh Test" in state_names

# 2. State detail
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_state_detail(mock_get_user, db_session, geo_data):
    user_id = str(uuid.uuid4())
    citizen = User(id=uuid.UUID(user_id), full_name="Citizen Tester", email="c@test.com", role_id=geo_data["citizen_role"].id, status="active")
    db_session.add(citizen)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "c@test.com"))

    response = client.get(f"/api/v1/states/{geo_data['state_ap'].id}", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["state_name"] == "Andhra Pradesh Test"

# 3. State -> districts
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_state_districts(mock_get_user, db_session, geo_data):
    user_id = str(uuid.uuid4())
    citizen = User(id=uuid.UUID(user_id), full_name="Citizen Tester", email="c@test.com", role_id=geo_data["citizen_role"].id, status="active")
    db_session.add(citizen)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "c@test.com"))

    response = client.get(f"/api/v1/states/{geo_data['state_ap'].id}/districts", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["district_name"] == "Visakhapatnam District Test"

# 4. District detail
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_district_detail(mock_get_user, db_session, geo_data):
    user_id = str(uuid.uuid4())
    citizen = User(id=uuid.UUID(user_id), full_name="Citizen Tester", email="c@test.com", role_id=geo_data["citizen_role"].id, status="active")
    db_session.add(citizen)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "c@test.com"))

    response = client.get(f"/api/v1/districts/{geo_data['dist_vizag'].id}", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["district_name"] == "Visakhapatnam District Test"
    assert data["state_name"] == "Andhra Pradesh Test"

# 5. District -> cities
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_district_cities(mock_get_user, db_session, geo_data):
    user_id = str(uuid.uuid4())
    citizen = User(id=uuid.UUID(user_id), full_name="Citizen Tester", email="c@test.com", role_id=geo_data["citizen_role"].id, status="active")
    db_session.add(citizen)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "c@test.com"))

    response = client.get(f"/api/v1/districts/{geo_data['dist_vizag'].id}/cities", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["city_name"] == "Visakhapatnam City Test"

# 6. City detail
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_city_detail(mock_get_user, db_session, geo_data):
    user_id = str(uuid.uuid4())
    citizen = User(id=uuid.UUID(user_id), full_name="Citizen Tester", email="c@test.com", role_id=geo_data["citizen_role"].id, status="active")
    db_session.add(citizen)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "c@test.com"))

    response = client.get(f"/api/v1/cities/{geo_data['city_vizag'].id}", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["city_name"] == "Visakhapatnam City Test"
    assert data["district_name"] == "Visakhapatnam District Test"
    assert data["state_name"] == "Andhra Pradesh Test"

# 7. City -> zones
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_city_zones(mock_get_user, db_session, geo_data):
    user_id = str(uuid.uuid4())
    citizen = User(id=uuid.UUID(user_id), full_name="Citizen Tester", email="c@test.com", role_id=geo_data["citizen_role"].id, status="active")
    db_session.add(citizen)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "c@test.com"))

    response = client.get(f"/api/v1/cities/{geo_data['city_vizag'].id}/zones", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["zone_name"] == "Vizag Zone One Test"

# 8. Zone -> wards
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_zone_wards(mock_get_user, db_session, geo_data):
    user_id = str(uuid.uuid4())
    citizen = User(id=uuid.UUID(user_id), full_name="Citizen Tester", email="c@test.com", role_id=geo_data["citizen_role"].id, status="active")
    db_session.add(citizen)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "c@test.com"))

    response = client.get(f"/api/v1/zones/{geo_data['zone_vizag'].id}/wards", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["ward_name"] == "Vizag Ward A Test"

# 9. Ward detail
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_ward_detail(mock_get_user, db_session, geo_data):
    user_id = str(uuid.uuid4())
    citizen = User(id=uuid.UUID(user_id), full_name="Citizen Tester", email="c@test.com", role_id=geo_data["citizen_role"].id, status="active")
    db_session.add(citizen)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "c@test.com"))

    response = client.get(f"/api/v1/wards/{geo_data['ward_vizag'].id}", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["ward_name"] == "Vizag Ward A Test"
    assert data["zone_name"] == "Vizag Zone One Test"
    assert data["city_name"] == "Visakhapatnam City Test"
    assert data["district_name"] == "Visakhapatnam District Test"
    assert data["state_name"] == "Andhra Pradesh Test"

# 10. Invalid IDs -> 404
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_invalid_ids_404(mock_get_user, db_session, geo_data):
    user_id = str(uuid.uuid4())
    citizen = User(id=uuid.UUID(user_id), full_name="Citizen Tester", email="c@test.com", role_id=geo_data["citizen_role"].id, status="active")
    db_session.add(citizen)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "c@test.com"))

    fake_id = uuid.uuid4()
    # State 404
    res = client.get(f"/api/v1/states/{fake_id}", headers={"Authorization": "Bearer token"})
    assert res.status_code == status.HTTP_404_NOT_FOUND

    # District 404
    res = client.get(f"/api/v1/districts/{fake_id}", headers={"Authorization": "Bearer token"})
    assert res.status_code == status.HTTP_404_NOT_FOUND

    # City 404
    res = client.get(f"/api/v1/cities/{fake_id}", headers={"Authorization": "Bearer token"})
    assert res.status_code == status.HTTP_404_NOT_FOUND

# 11. Missing token -> 401
def test_missing_token_401():
    response = client.get("/api/v1/states")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

# 12. Invalid token -> 401
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_invalid_token_401(mock_get_user):
    mock_get_user.side_effect = Exception("Invalid token")
    response = client.get("/api/v1/states", headers={"Authorization": "Bearer invalid_token"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

# 13. Valid scoped access -> 200
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_valid_scoped_access(mock_get_user, db_session, geo_data):
    # State Operator for AP
    user_id = str(uuid.uuid4())
    op = User(
        id=uuid.UUID(user_id),
        full_name="AP State Op",
        email="ap_op@test.com",
        role_id=geo_data["state_op_role"].id,
        state_id=geo_data["state_ap"].id,
        status="active"
    )
    db_session.add(op)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "ap_op@test.com"))

    # AP state details -> should succeed (200)
    response = client.get(f"/api/v1/states/{geo_data['state_ap'].id}", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_200_OK

# 14. Out-of-scope state -> 403
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_out_of_scope_state_403(mock_get_user, db_session, geo_data):
    # State Operator for TS
    user_id = str(uuid.uuid4())
    op = User(
        id=uuid.UUID(user_id),
        full_name="TS State Op",
        email="ts_op@test.com",
        role_id=geo_data["state_op_role"].id,
        state_id=geo_data["state_ts"].id,
        status="active"
    )
    db_session.add(op)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "ts_op@test.com"))

    # Attempt to access AP state details -> should fail (403)
    response = client.get(f"/api/v1/states/{geo_data['state_ap'].id}", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_403_FORBIDDEN

# 15. Out-of-scope district -> 403
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_out_of_scope_district_403(mock_get_user, db_session, geo_data):
    # State Operator for TS
    user_id = str(uuid.uuid4())
    op = User(
        id=uuid.UUID(user_id),
        full_name="TS State Op",
        email="ts_op@test.com",
        role_id=geo_data["state_op_role"].id,
        state_id=geo_data["state_ts"].id,
        status="active"
    )
    db_session.add(op)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "ts_op@test.com"))

    # Attempt to access Vizag District (under AP) -> should fail (403)
    response = client.get(f"/api/v1/districts/{geo_data['dist_vizag'].id}", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_403_FORBIDDEN

# 16. Out-of-scope city -> 403
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_out_of_scope_city_403(mock_get_user, db_session, geo_data):
    # City Operator for Hyd
    user_id = str(uuid.uuid4())
    op = User(
        id=uuid.UUID(user_id),
        full_name="Hyd City Op",
        email="hyd_op@test.com",
        role_id=geo_data["city_op_role"].id,
        city_id=geo_data["city_hyd"].id,
        status="active"
    )
    db_session.add(op)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "hyd_op@test.com"))

    # Attempt to access Vizag City -> should fail (403)
    response = client.get(f"/api/v1/cities/{geo_data['city_vizag'].id}", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_403_FORBIDDEN

# 17. Citizen metadata behavior
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_citizen_metadata_access(mock_get_user, db_session, geo_data):
    # Citizen has access to all metadata
    user_id = str(uuid.uuid4())
    citizen = User(id=uuid.UUID(user_id), full_name="Citizen", email="c@test.com", role_id=geo_data["citizen_role"].id, status="active")
    db_session.add(citizen)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "c@test.com"))

    # Can fetch state details
    res1 = client.get(f"/api/v1/states/{geo_data['state_ap'].id}", headers={"Authorization": "Bearer token"})
    assert res1.status_code == status.HTTP_200_OK

    # Can fetch city details
    res2 = client.get(f"/api/v1/cities/{geo_data['city_vizag'].id}", headers={"Authorization": "Bearer token"})
    assert res2.status_code == status.HTTP_200_OK

# 18. Admin/national admin behavior
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_admin_metadata_access(mock_get_user, db_session, geo_data):
    # Admin has access to all metadata
    user_id = str(uuid.uuid4())
    admin = User(id=uuid.UUID(user_id), full_name="Admin User", email="admin@test.com", role_id=geo_data["admin_role"].id, status="active")
    db_session.add(admin)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "admin@test.com"))

    # Can fetch state details (AP)
    res1 = client.get(f"/api/v1/states/{geo_data['state_ap'].id}", headers={"Authorization": "Bearer token"})
    assert res1.status_code == status.HTTP_200_OK

    # Can fetch state details (TS)
    res2 = client.get(f"/api/v1/states/{geo_data['state_ts'].id}", headers={"Authorization": "Bearer token"})
    assert res2.status_code == status.HTTP_200_OK

# 19. Pagination limits
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_pagination_limits(mock_get_user, db_session, geo_data):
    user_id = str(uuid.uuid4())
    citizen = User(id=uuid.UUID(user_id), full_name="Citizen", email="c@test.com", role_id=geo_data["citizen_role"].id, status="active")
    db_session.add(citizen)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "c@test.com"))

    # Query with limit 1
    response = client.get("/api/v1/states?limit=1", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1

# 20. Existing /cities compatibility
@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_existing_cities_endpoint(mock_get_user, db_session, geo_data):
    user_id = str(uuid.uuid4())
    citizen = User(id=uuid.UUID(user_id), full_name="Citizen", email="c@test.com", role_id=geo_data["citizen_role"].id, status="active")
    db_session.add(citizen)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, "c@test.com"))

    response = client.get("/api/v1/cities", headers={"Authorization": "Bearer token"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 2
    city_names = [c["city_name"] for c in data]
    assert "Visakhapatnam City Test" in city_names
    assert "Hyderabad City Test" in city_names
