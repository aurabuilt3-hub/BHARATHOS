import pytest
import uuid
from fastapi import status, Depends, APIRouter
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session
from app.main import app
from app.db.session import engine, get_db
from app.dependencies.auth import get_supabase_user, get_current_user, require_role, verify_geographic_scope
from app.models.models import User, Role, State, District, City, Department

# Add a test-only router with endpoints to check role and scope authorization
test_router = APIRouter(prefix="/api/v1/test-auth")

@test_router.get("/admin-only")
def admin_only_route(current_user: User = Depends(require_role("admin"))):
    return {"message": "Admin authorized"}

@test_router.get("/officer-only")
def officer_only_route(current_user: User = Depends(require_role("officer"))):
    return {"message": "Officer authorized"}

app.include_router(test_router)

# Set up client AFTER including router
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

# Mock structures for Supabase Auth responses
class MockUserObj:
    def __init__(self, id_str, email):
        self.id = id_str
        self.email = email

class MockUserResponse:
    def __init__(self, user_obj):
        self.user = user_obj

def test_missing_auth_header():
    # 1. No Authorization header -> 401
    response = client.get("/api/v1/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Not authenticated" in response.json()["detail"]

@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_invalid_token(mock_get_user):
    # 2. Invalid token -> 401
    mock_get_user.side_effect = Exception("Auth token invalid or expired")
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid_jwt"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Authentication failed" in response.json()["detail"]

@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_valid_token_missing_profile(mock_get_user):
    # 3. Valid token + missing profile -> /auth/me returns 404
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(uuid.uuid4()), f"new_user_{uuid.uuid4()}@example.com"))
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer valid_jwt"})
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "User profile not registered" in response.json()["detail"]

@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_profile_sync_creates_citizen(mock_get_user, db_session):
    # 4. Valid token + missing profile -> /auth/sync-profile creates profile
    user_id = str(uuid.uuid4())
    unique_email = f"sync_test_{uuid.uuid4()}@example.com"
    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, unique_email))
    
    # Body attempting to escalate role to admin
    payload = {
        "full_name": "Sync Tester",
        "phone": "9999999999",
        "role_name": "admin",
        "city_id": str(uuid.uuid4())
    }
    
    response = client.post(
        "/api/v1/auth/sync-profile",
        headers={"Authorization": "Bearer valid_jwt"},
        json=payload
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == user_id
    assert data["email"] == unique_email
    # Ensure role escalated attempt was ignored and defaulted to citizen
    assert data["role_name"] == "citizen"
    assert data["city_id"] is None
    
    # Clean up verification using database session
    user = db_session.query(User).filter(User.id == uuid.UUID(user_id)).first()
    assert user is not None
    assert user.role.role_name == "citizen"

@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_idempotent_profile_sync(mock_get_user, db_session):
    # 5. Repeated sync -> no duplicate user and safe fields updated
    user_id = str(uuid.uuid4())
    unique_email = f"idempotent_{uuid.uuid4()}@example.com"
    mock_get_user.return_value = MockUserResponse(MockUserObj(user_id, unique_email))
    
    # First sync
    payload = {"full_name": "First Name", "phone": "1111111111", "role_name": "citizen"}
    res1 = client.post("/api/v1/auth/sync-profile", headers={"Authorization": "Bearer jwt"}, json=payload)
    assert res1.status_code == status.HTTP_200_OK
    
    # Second sync with new name/phone
    payload2 = {"full_name": "Second Name", "phone": "2222222222", "role_name": "citizen"}
    res2 = client.post("/api/v1/auth/sync-profile", headers={"Authorization": "Bearer jwt"}, json=payload2)
    assert res2.status_code == status.HTTP_200_OK
    
    data = res2.json()
    assert data["full_name"] == "Second Name"
    assert data["phone"] == "2222222222"
    
    # Count matching users to verify idempotency
    count = db_session.query(User).filter(User.id == uuid.UUID(user_id)).count()
    assert count == 1

@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_role_based_access_control(mock_get_user, db_session):
    # Create an admin user and an officer user in the test database
    admin_role = db_session.query(Role).filter(Role.role_name == "admin").first()
    if not admin_role:
        admin_role = Role(id=uuid.uuid4(), role_name="admin")
        db_session.add(admin_role)
        db_session.flush()

    officer_role = db_session.query(Role).filter(Role.role_name == "officer").first()
    if not officer_role:
        officer_role = Role(id=uuid.uuid4(), role_name="officer")
        db_session.add(officer_role)
        db_session.flush()

    admin_id = str(uuid.uuid4())
    admin_user = User(
        id=uuid.UUID(admin_id),
        full_name="Admin User",
        email="admin@example.com",
        role_id=admin_role.id,
        status="active"
    )
    
    officer_id = str(uuid.uuid4())
    officer_user = User(
        id=uuid.UUID(officer_id),
        full_name="Officer User",
        email="officer@example.com",
        role_id=officer_role.id,
        status="active"
    )
    
    db_session.add_all([admin_user, officer_user])
    db_session.commit()

    # 1. Admin accesses /admin-only route -> 200 OK
    mock_get_user.return_value = MockUserResponse(MockUserObj(admin_id, "admin@example.com"))
    response = client.get("/api/v1/test-auth/admin-only", headers={"Authorization": "Bearer admin_jwt"})
    assert response.status_code == status.HTTP_200_OK

    # 2. Officer accesses /admin-only route -> 403 Forbidden
    mock_get_user.return_value = MockUserResponse(MockUserObj(officer_id, "officer@example.com"))
    response = client.get("/api/v1/test-auth/admin-only", headers={"Authorization": "Bearer officer_jwt"})
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "does not have permission" in response.json()["detail"]

def test_geographic_scope_verification(db_session):
    # Setup geographic hierarchy
    state = State(id=uuid.uuid4(), state_name="Test AP", status="active")
    db_session.add(state)
    db_session.flush()

    district = District(id=uuid.uuid4(), state_id=state.id, district_name="Test VSP", status="active")
    db_session.add(district)
    db_session.flush()

    city = City(
        id=uuid.uuid4(),
        district_id=district.id,
        city_name="Test Visakhapatnam",
        population=1000000,
        latitude=17.6,
        longitude=83.2,
        status="active"
    )
    db_session.add(city)
    db_session.flush()

    other_state = State(id=uuid.uuid4(), state_name="Test TS", status="active")
    db_session.add(other_state)
    db_session.flush()

    # 1. National Admin User
    admin_role = db_session.query(Role).filter(Role.role_name == "admin").first()
    if not admin_role:
        admin_role = Role(id=uuid.uuid4(), role_name="admin")
        db_session.add(admin_role)
        db_session.flush()
    
    nat_user = User(
        id=uuid.uuid4(),
        full_name="Nat Admin",
        email="nat@example.com",
        role_id=admin_role.id,
        status="active"
    )
    db_session.add(nat_user)
    db_session.flush()

    # National admin should have access to everything
    assert verify_geographic_scope(nat_user, target_state_id=state.id, db=db_session) is True
    assert verify_geographic_scope(nat_user, target_state_id=other_state.id, db=db_session) is True

    # 2. State Operator User
    state_op_role = db_session.query(Role).filter(Role.role_name == "state_operator").first()
    if not state_op_role:
        state_op_role = Role(id=uuid.uuid4(), role_name="state_operator")
        db_session.add(state_op_role)
        db_session.flush()

    state_user = User(
        id=uuid.uuid4(),
        full_name="State Op",
        email="state@example.com",
        role_id=state_op_role.id,
        state_id=state.id,
        status="active"
    )
    db_session.add(state_user)
    db_session.flush()

    # State operator should have access within their state but not other states
    assert verify_geographic_scope(state_user, target_state_id=state.id, db=db_session) is True
    assert verify_geographic_scope(state_user, target_city_id=city.id, db=db_session) is True
    assert verify_geographic_scope(state_user, target_state_id=other_state.id, db=db_session) is False

    # 3. City Operator User
    city_op_role = db_session.query(Role).filter(Role.role_name == "city_operator").first()
    if not city_op_role:
        city_op_role = Role(id=uuid.uuid4(), role_name="city_operator")
        db_session.add(city_op_role)
        db_session.flush()

    city_user = User(
        id=uuid.uuid4(),
        full_name="City Op",
        email="city@example.com",
        role_id=city_op_role.id,
        city_id=city.id,
        status="active"
    )
    db_session.add(city_user)
    db_session.flush()

    # City operator should have access to their own city but not other scopes
    assert verify_geographic_scope(city_user, target_city_id=city.id, db=db_session) is True
    assert verify_geographic_scope(city_user, target_state_id=state.id, db=db_session) is False
