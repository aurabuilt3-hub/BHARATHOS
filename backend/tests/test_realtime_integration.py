import pytest
import uuid
import json
from datetime import datetime, UTC, timedelta
from fastapi import status
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.main import app
from app.db.session import engine, get_db
from app.models.models import User, Role, State, District, City, Facility, DigitalTwinNode, TelemetryRecord, AuditLog
from app.data_sources.source_registry import SOURCE_REGISTRY
from app.services.data_sync_service import calculate_freshness, DataSyncService
from app.integrations.weather.client import WeatherClient
from app.integrations.air_quality.client import AirQualityClient
from app.integrations.facilities.client import FacilitiesClient

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
def setup_test_data(db_session):
    # Ensure roles
    roles = {}
    for role_name in ("citizen", "admin", "national_admin"):
        r = db_session.query(Role).filter(Role.role_name == role_name).first()
        if not r:
            r = Role(id=uuid.uuid4(), role_name=role_name)
            db_session.add(r)
        roles[role_name] = r
    db_session.commit()

    # Seed Geo
    state = db_session.query(State).filter(State.state_name == "Andhra Pradesh").first()
    if not state:
        state = State(id=uuid.uuid4(), state_name="Andhra Pradesh")
        db_session.add(state)
    db_session.commit()

    district = db_session.query(District).filter(District.district_name == "Visakhapatnam District").first()
    if not district:
        district = District(id=uuid.uuid4(), state_id=state.id, district_name="Visakhapatnam District")
        db_session.add(district)
    db_session.commit()

    city = db_session.query(City).filter(City.city_name == "Visakhapatnam").first()
    if not city:
        city = City(id=uuid.uuid4(), district_id=district.id, city_name="Visakhapatnam")
        db_session.add(city)
    db_session.commit()

    # Setup Users
    admin_user = db_session.query(User).filter(User.email == "admin@bharatos.gov.in").first()
    if not admin_user:
        admin_user = User(
            id=uuid.uuid4(),
            email="admin@bharatos.gov.in",
            full_name="System Admin",
            role_id=roles["admin"].id,
            city_id=city.id,
            district_id=district.id,
            state_id=state.id
        )
        db_session.add(admin_user)

    citizen_user = db_session.query(User).filter(User.email == "citizen@bharatos.gov.in").first()
    if not citizen_user:
        citizen_user = User(
            id=uuid.uuid4(),
            email="citizen@bharatos.gov.in",
            full_name="Citizen One",
            role_id=roles["citizen"].id,
            city_id=city.id,
            district_id=district.id,
            state_id=state.id
        )
        db_session.add(citizen_user)

    # Seed weather monitoring station node if missing
    node = db_session.query(DigitalTwinNode).filter(DigitalTwinNode.id == uuid.UUID("e47ac10b-58cc-4372-a567-0e02b2c3d495")).first()
    if not node:
        node = DigitalTwinNode(
            id=uuid.UUID("e47ac10b-58cc-4372-a567-0e02b2c3d495"),
            state_id=state.id,
            city_id=city.id,
            name="Vizag Weather & Air Quality Monitoring Station",
            type="weather",
            status="normal",
            latitude=17.6868,
            longitude=83.2185
        )
        db_session.add(node)

    db_session.commit()
    return {
        "state": state,
        "district": district,
        "city": city,
        "admin": admin_user,
        "citizen": citizen_user
    }


def test_source_registry():
    """1. Test source registry contents"""
    assert "open_meteo_weather" in SOURCE_REGISTRY
    assert "open_meteo_aqi" in SOURCE_REGISTRY
    assert "openstreetmap_overpass" in SOURCE_REGISTRY
    assert "apsdma_alerts" in SOURCE_REGISTRY
    assert SOURCE_REGISTRY["apsdma_alerts"]["status"] == "UNAVAILABLE"


def test_freshness_calculation():
    """2. Test freshness state logic"""
    now = datetime.now(UTC)
    assert calculate_freshness(now) == "FRESH"
    assert calculate_freshness(now - timedelta(minutes=45)) == "FRESH"
    assert calculate_freshness(now - timedelta(hours=2)) == "STALE"
    assert calculate_freshness(now - timedelta(hours=5)) == "EXPIRED"
    assert calculate_freshness(None) == "UNKNOWN"


@patch("urllib.request.urlopen")
def test_weather_client_normalization(mock_urlopen):
    """3. Test Open-Meteo weather client parsing and normalization"""
    mock_response = MagicMock()
    mock_response.status = 200
    mock_response.read.return_value = json.dumps({
        "current": {
            "time": "2026-08-10T12:00",
            "temperature_2m": 31.2,
            "relative_humidity_2m": 72.0,
            "precipitation": 1.5,
            "wind_speed_10m": 14.2,
            "weather_code": 3
        }
    }).encode("utf-8")
    mock_urlopen.return_value.__enter__.return_value = mock_response

    client_weather = WeatherClient()
    norm = client_weather.get_weather()
    
    assert norm.temperature == 31.2
    assert norm.humidity == 72.0
    assert norm.precipitation == 1.5
    assert norm.wind_speed == 14.2
    assert norm.weather_code == 3
    assert norm.source_type == "OPEN_DATA"
    assert norm.source_name == "Open-Meteo"


@patch("urllib.request.urlopen")
def test_air_quality_client_normalization(mock_urlopen):
    """4. Test Open-Meteo air quality client normalization"""
    mock_response = MagicMock()
    mock_response.status = 200
    mock_response.read.return_value = json.dumps({
        "current": {
            "time": "2026-08-10T12:00",
            "us_aqi": 42.0,
            "pm2_5": 11.2,
            "pm10": 22.4,
            "nitrogen_dioxide": 4.1,
            "ozone": 12.5
        }
    }).encode("utf-8")
    mock_urlopen.return_value.__enter__.return_value = mock_response

    client_aqi = AirQualityClient()
    norm = client_aqi.get_air_quality()

    assert norm.us_aqi == 42.0
    assert norm.pm2_5 == 11.2
    assert norm.pm10 == 22.4
    assert norm.nitrogen_dioxide == 4.1
    assert norm.ozone == 12.5


@patch("urllib.request.urlopen")
def test_facilities_client_normalization(mock_urlopen):
    """5. Test Overpass facilities client parsing"""
    mock_response = MagicMock()
    mock_response.status = 200
    mock_response.read.return_value = json.dumps({
        "elements": [
            {
                "type": "node",
                "id": 12345,
                "lat": 17.72,
                "lon": 83.32,
                "tags": {
                    "amenity": "hospital",
                    "name": "Vizag Area Hospital",
                    "addr:street": "Beach Road",
                    "phone": "0891-123456"
                }
            }
        ]
    }).encode("utf-8")
    mock_urlopen.return_value.__enter__.return_value = mock_response

    client_fac = FacilitiesClient()
    facs = client_fac.get_facilities()

    assert len(facs) == 1
    assert facs[0].name == "Vizag Area Hospital"
    assert facs[0].facility_type == "HOSPITAL"
    assert facs[0].latitude == 17.72
    assert facs[0].longitude == 83.32


@patch("urllib.request.urlopen")
def test_client_failures(mock_urlopen):
    """6. Test API failure handling"""
    mock_urlopen.side_effect = Exception("Connection timed out")

    # Verify weather failure throws
    with pytest.raises(Exception, match="retrieval failed"):
        WeatherClient().get_weather()


@patch("app.services.data_sync_service.WeatherClient.get_weather")
@patch("app.services.data_sync_service.AirQualityClient.get_air_quality")
@patch("app.services.data_sync_service.FacilitiesClient.get_facilities")
def test_data_sync_service_success(mock_facs, mock_aqi, mock_weather, db_session, setup_test_data):
    """7. Test sync success updates db nodes, records, and logs AuditLog"""
    from app.integrations.schemas import NormalizedWeather, NormalizedAirQuality, NormalizedFacility
    
    mock_weather.return_value = NormalizedWeather(
        temperature=29.0, humidity=80.0, precipitation=0.0, wind_speed=10.0, weather_code=1, observed_at=datetime.now(UTC)
    )
    mock_aqi.return_value = NormalizedAirQuality(
        us_aqi=50.0, pm2_5=12.0, pm10=24.0, observed_at=datetime.now(UTC)
    )
    mock_facs.return_value = [
        NormalizedFacility(
            name="Live Overpass Police Station",
            facility_type="POLICE_STATION",
            address="MVP Colony Sec 4",
            phone=None,
            latitude=17.73,
            longitude=83.31,
            source_type="OPEN_DATA",
            source_name="OpenStreetMap",
            source_url="http://osm.org",
            source_record_id="999888",
            observed_at=datetime.now(UTC)
        )
    ]

    report = DataSyncService.sync_all(db_session, user_id=setup_test_data["admin"].id)
    assert report["status"] == "success"

    # Verify digital twin node updated
    node = db_session.get(DigitalTwinNode, uuid.UUID("e47ac10b-58cc-4372-a567-0e02b2c3d495"))
    assert node.last_telemetry["temperature"] == 29.0
    assert node.last_telemetry["aqi"] == 50.0

    # Verify new facility created
    fac = db_session.query(Facility).filter(Facility.name == "Live Overpass Police Station").first()
    assert fac is not None
    assert fac.extra_data.get("source_record_id") == "999888"

    # Verify AuditLog logged
    audit = db_session.query(AuditLog).filter(AuditLog.action == "DATA_INGESTION_SYNC").first()
    assert audit is not None
    assert audit.new_values["status"] == "success"


@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_admin_rbac_and_sync(mock_get_user, db_session, setup_test_data):
    """8. Test sync and status RBAC restrictions"""
    # 1. Citizen gets rejected
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_test_data["citizen"].id), setup_test_data["citizen"].email))
    response = client.post("/api/v1/admin/data-ingestion/sync", headers={"Authorization": "Bearer dummy_token"})
    assert response.status_code == status.HTTP_403_FORBIDDEN

    # 2. Admin succeeds
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_test_data["admin"].id), setup_test_data["admin"].email))
    
    with patch("app.services.data_sync_service.DataSyncService.sync_all") as mock_sync:
        mock_sync.return_value = {"status": "success", "duration_ms": 100}
        response = client.post("/api/v1/admin/data-ingestion/sync", headers={"Authorization": "Bearer dummy_token"})
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["status"] == "success"


@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_dashboard_overview_scopes(mock_get_user, db_session, setup_test_data):
    """9. Test dashboard overview aggregates and returns scopes correctly"""
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_test_data["citizen"].id), setup_test_data["citizen"].email))

    response = client.get("/api/v1/dashboard/overview", headers={"Authorization": "Bearer dummy_token"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "active_incidents_count" in data
    assert "resources" in data
    assert "facilities_count" in data

