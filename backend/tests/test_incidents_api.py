import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app
from app.db.session import get_db

client = TestClient(app)

def test_version_endpoint():
    response = client.get("/api/v1/system/version")
    assert response.status_code == 200
    data = response.json()
    assert data["version"] == "1.0.0"
    assert data["sprint"] == "Sprint 4"

def test_list_incidents_endpoint():
    # Mock database session returning an empty list to prevent real DB connection requirements in test environment
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.filter.return_value.filter.return_value.filter.return_value.limit.return_value.offset.return_value.all.return_value = []
    
    app.dependency_overrides[get_db] = lambda: mock_db
    try:
        response = client.get("/api/v1/incidents")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    finally:
        app.dependency_overrides.clear()
