import pytest
import uuid
from datetime import datetime, UTC
from fastapi import status
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import engine, get_db
from app.models.models import User, Role, State, District, City, Zone, Ward, Facility

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
    transaction.rollback()
    connection.close()

@pytest.fixture(autouse=True)
def override_db(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    yield
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture
def setup_data(db_session):
    # Ensure roles exist
    roles = {}
    for role_name in ("citizen", "officer", "dept_head", "admin", "state_admin", "national_admin"):
        r = db_session.query(Role).filter(Role.role_name == role_name).first()
        if not r:
            r = Role(id=uuid.uuid4(), role_name=role_name)
            db_session.add(r)
        roles[role_name] = r
    db_session.flush()

    # Geography Setup
    state_ap = State(id=uuid.uuid4(), state_name="Andhra Pradesh Test", status="active")
    db_session.add(state_ap)
    db_session.flush()

    state_ts = State(id=uuid.uuid4(), state_name="Telangana Test", status="active")
    db_session.add(state_ts)
    db_session.flush()

    dist_vizag = District(id=uuid.uuid4(), state_id=state_ap.id, district_name="Visakhapatnam District Test", status="active")
    db_session.add(dist_vizag)
    db_session.flush()

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

    city_hyd = City(
        id=uuid.uuid4(),
        district_id=dist_vizag.id,  # keep simple for tests
        city_name="Hyderabad City Test",
        population=8000000,
        latitude=17.38,
        longitude=78.48,
        status="active"
    )
    db_session.add(city_hyd)
    db_session.flush()

    zone_vizag = Zone(
        id=uuid.uuid4(),
        city_id=city_vizag.id,
        zone_name="Vizag Zone Test",
        polygon={"type": "Polygon", "coordinates": []},
        risk_level="low"
    )
    db_session.add(zone_vizag)
    db_session.flush()

    ward_vizag = Ward(
        id=uuid.uuid4(),
        zone_id=zone_vizag.id,
        ward_name="Vizag Ward Test"
    )
    db_session.add(ward_vizag)
    db_session.flush()

    # Create users
    citizen_user = User(
        id=uuid.uuid4(),
        full_name="Citizen User",
        email="citizen@test.com",
        role_id=roles["citizen"].id,
        status="active"
    )
    db_session.add(citizen_user)

    admin_user = User(
        id=uuid.uuid4(),
        full_name="Admin User",
        email="admin@test.com",
        role_id=roles["admin"].id,
        status="active"
    )
    db_session.add(admin_user)

    scoped_state_admin = User(
        id=uuid.uuid4(),
        full_name="AP State Admin",
        email="ap_state_admin@test.com",
        role_id=roles["state_admin"].id,
        state_id=state_ap.id,
        status="active"
    )
    db_session.add(scoped_state_admin)

    scoped_city_operator = User(
        id=uuid.uuid4(),
        full_name="Vizag Operator",
        email="vizag_operator@test.com",
        role_id=roles["dept_head"].id,
        city_id=city_vizag.id,
        status="active"
    )
    db_session.add(scoped_city_operator)

    db_session.commit()

    return {
        "roles": roles,
        "state_ap": state_ap,
        "state_ts": state_ts,
        "dist_vizag": dist_vizag,
        "city_vizag": city_vizag,
        "city_hyd": city_hyd,
        "zone_vizag": zone_vizag,
        "ward_vizag": ward_vizag,
        "citizen": citizen_user,
        "admin": admin_user,
        "state_admin": scoped_state_admin,
        "vizag_operator": scoped_city_operator,
    }


def test_missing_and_invalid_authentication():
    # Test 11: Missing Auth -> 401
    resp = client.get("/api/v1/facilities/")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    # Test 12: Invalid Auth -> 401
    with patch("app.dependencies.auth.supabase_client.auth.get_user", side_effect=Exception("Invalid token")):
        resp = client.get("/api/v1/facilities/", headers={"Authorization": "Bearer invalid_token"})
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_facility_operations(mock_get_user, db_session, setup_data):
    # Test 1: Model creation
    fac = Facility(
        name="Test Hospital",
        facility_type="HOSPITAL",
        address="123 Street",
        phone="555-1234",
        latitude=17.68,
        longitude=83.21,
        state_id=setup_data["state_ap"].id,
        district_id=setup_data["dist_vizag"].id,
        city_id=setup_data["city_vizag"].id,
        zone_id=setup_data["zone_vizag"].id,
        ward_id=setup_data["ward_vizag"].id,
        source_type="VERIFIED_PUBLIC",
        source_name="Govt Portal",
        source_url="http://govt.in",
        verified_at=datetime.now(UTC),
    )
    db_session.add(fac)
    db_session.commit()

    # Authenticate as admin
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_data["admin"].id), setup_data["admin"].email))
    auth_headers = {"Authorization": "Bearer dummy_token"}

    # Test 3: Facility detail
    resp = client.get(f"/api/v1/facilities/{fac.id}", headers=auth_headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["name"] == "Test Hospital"
    assert resp.json()["source_type"] == "VERIFIED_PUBLIC"

    # Test 10: Invalid facility ID -> 404
    resp = client.get(f"/api/v1/facilities/{uuid.uuid4()}", headers=auth_headers)
    assert resp.status_code == status.HTTP_404_NOT_FOUND

    # Test 2: Facility list & Test 4: Pagination
    resp = client.get(f"/api/v1/facilities/?state_id={setup_data['state_ap'].id}&page=1&limit=5", headers=auth_headers)
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["id"] == str(fac.id)

    # Test 5, 6, 7, 8, 9: Filters
    resp = client.get(f"/api/v1/facilities/?state_id={setup_data['state_ap'].id}&facility_type=HOSPITAL", headers=auth_headers)
    assert len(resp.json()["items"]) == 1

    resp = client.get(f"/api/v1/facilities/?state_id={setup_data['state_ap'].id}&facility_type=POLICE_STATION", headers=auth_headers)
    assert len(resp.json()["items"]) == 0

    resp = client.get(f"/api/v1/facilities/?state_id={setup_data['state_ap'].id}&city_id={setup_data['city_vizag'].id}", headers=auth_headers)
    assert len(resp.json()["items"]) == 1

    resp = client.get(f"/api/v1/facilities/?state_id={setup_data['state_ap'].id}&district_id={setup_data['dist_vizag'].id}", headers=auth_headers)
    assert len(resp.json()["items"]) == 1

    resp = client.get(f"/api/v1/facilities/?state_id={setup_data['state_ap'].id}", headers=auth_headers)
    assert len(resp.json()["items"]) == 1

    resp = client.get(f"/api/v1/facilities/?state_id={setup_data['state_ap'].id}&source_type=VERIFIED_PUBLIC", headers=auth_headers)
    assert len(resp.json()["items"]) == 1


@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_scoped_operator_access(mock_get_user, db_session, setup_data):
    # Setup two facilities: one in AP (Vizag), one in TS (Hyd)
    fac_ap = Facility(
        name="Vizag Police Station",
        facility_type="POLICE_STATION",
        latitude=17.68,
        longitude=83.21,
        state_id=setup_data["state_ap"].id,
        city_id=setup_data["city_vizag"].id,
        source_type="SIMULATED",
    )
    fac_ts = Facility(
        name="Hyd Police Station",
        facility_type="POLICE_STATION",
        latitude=17.38,
        longitude=78.48,
        state_id=setup_data["state_ts"].id,
        city_id=setup_data["city_hyd"].id,
        source_type="SIMULATED",
    )
    db_session.add_all([fac_ap, fac_ts])
    db_session.commit()

    # Authenticate as Vizag Operator (city scoped to Vizag)
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_data["vizag_operator"].id), setup_data["vizag_operator"].email))
    auth_headers = {"Authorization": "Bearer dummy_token"}

    # Test 13: Scoped operator accessing own geography -> 200
    resp = client.get(f"/api/v1/facilities/{fac_ap.id}", headers=auth_headers)
    assert resp.status_code == status.HTTP_200_OK

    # Test 14: Scoped operator accessing another geography -> 403
    resp = client.get(f"/api/v1/facilities/{fac_ts.id}", headers=auth_headers)
    assert resp.status_code == status.HTTP_403_FORBIDDEN

    # Testing list endpoint enforces scope:
    # Vizag operator listing facilities should only see Vizag facilities
    resp = client.get("/api/v1/facilities/", headers=auth_headers)
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["id"] == str(fac_ap.id)


@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_create_and_update_facility(mock_get_user, db_session, setup_data):
    # Test 15: Unauthorized role (citizen) attempting create -> 403
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_data["citizen"].id), setup_data["citizen"].email))
    auth_headers = {"Authorization": "Bearer dummy_token"}

    payload = {
        "name": "Citizen Built Fire Station",
        "facility_type": "FIRE_STATION",
        "latitude": 17.68,
        "longitude": 83.21,
        "state_id": str(setup_data["state_ap"].id),
        "city_id": str(setup_data["city_vizag"].id),
        "source_type": "SIMULATED",
    }
    resp = client.post("/api/v1/facilities/", headers=auth_headers, json=payload)
    assert resp.status_code == status.HTTP_403_FORBIDDEN

    # Test 16: Authorized administrative role (admin) creating facility
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_data["admin"].id), setup_data["admin"].email))
    resp = client.post("/api/v1/facilities/", headers=auth_headers, json=payload)
    assert resp.status_code == status.HTTP_201_CREATED
    created_id = resp.json()["id"]

    # Test 19: Source metadata preservation
    assert resp.json()["source_type"] == "SIMULATED"

    # Test 17: Facility update
    update_payload = {
        "name": "Updated Fire Station Name",
        "phone": "12345",
    }
    resp = client.patch(f"/api/v1/facilities/{created_id}", headers=auth_headers, json=update_payload)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["name"] == "Updated Fire Station Name"
    assert resp.json()["phone"] == "12345"

    # Test 18: Invalid payload (missing required latitude for create) -> 422
    bad_payload = {
        "name": "Bad Fire Station",
        "facility_type": "FIRE_STATION",
        # missing latitude/longitude
    }
    resp = client.post("/api/v1/facilities/", headers=auth_headers, json=bad_payload)
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
