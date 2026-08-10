import pytest
from fastapi import status
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app
from app.db.session import get_db

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "BHARATOS Backend"
    assert data["version"] == "1.0.0"

def test_readiness_endpoint_healthy():
    # Mock database session representing a healthy reachable db
    mock_db = MagicMock()
    mock_db.execute.return_value = None
    
    # Override get_db dependency dynamically
    app.dependency_overrides[get_db] = lambda: mock_db
    
    try:
        response = client.get("/api/v1/health/ready")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "ready"
        assert data["database"] == "connected"
    finally:
        app.dependency_overrides.clear()

def test_readiness_endpoint_unhealthy():
    # Mock database session throwing exception representing unavailable db
    mock_db = MagicMock()
    mock_db.execute.side_effect = Exception("Database is down")
    
    # Override get_db dependency dynamically
    app.dependency_overrides[get_db] = lambda: mock_db
    
    try:
        response = client.get("/api/v1/health/ready")
        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        data = response.json()
        assert data["status"] == "not_ready"
        assert data["database"] == "unavailable"
    finally:
        app.dependency_overrides.clear()
