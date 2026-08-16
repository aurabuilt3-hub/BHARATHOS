import pytest
from unittest.mock import MagicMock, patch
from pydantic import ValidationError

from app.ai.agents.flood_detection_agent import FloodDetectionAgent
from app.ai.schemas.agent_outputs import FloodDetectionResult

# Mock helper to override get_ai_config settings
def get_mock_config(key="real_key_for_test"):
    return {
        "model": "gemini-3.6-flash",
        "api_key": key,
        "temperature": 0.2,
        "timeout": 30.0
    }

# TEST 1: Normal weather + stable water level
@patch("app.ai.agents.flood_detection_agent.get_ai_config")
@patch("app.ai.agents.flood_detection_agent.ChatGoogleGenerativeAI")
def test_flood_detection_normal(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    # Normal output mock
    mock_structured.invoke.return_value = FloodDetectionResult(
        risk_detected=False,
        status="NORMAL",
        evidence=["Weather is clear", "Water level is stable at 1.2m"]
    )

    weather = {"location": "Visakhapatnam", "rainfall_mm": 0, "temperature_c": 28, "forecast": "clear"}
    telemetry = [{"node_name": "Drain Node 1", "value": 1.2, "unit": "m", "status": "normal", "source_type": "SIMULATED"}]

    res = FloodDetectionAgent.run(weather, telemetry)
    assert res.risk_detected is False
    assert res.status == "NORMAL"
    assert "clear" in res.evidence[0]

# TEST 2: Heavy rainfall + rising water level
@patch("app.ai.agents.flood_detection_agent.get_ai_config")
@patch("app.ai.agents.flood_detection_agent.ChatGoogleGenerativeAI")
def test_flood_detection_heavy_rainfall(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    # Heavy warning output mock
    mock_structured.invoke.return_value = FloodDetectionResult(
        risk_detected=True,
        status="WARNING",
        evidence=["Heavy rainfall of 120mm detected", "Water level has risen to 3.8m"]
    )

    weather = {"location": "Visakhapatnam", "rainfall_mm": 120, "temperature_c": 26, "forecast": "heavy_rain"}
    telemetry = [{"node_name": "Drain Node 1", "value": 3.8, "unit": "m", "status": "warning", "source_type": "SIMULATED"}]

    res = FloodDetectionAgent.run(weather, telemetry)
    assert res.risk_detected is True
    assert res.status == "WARNING"

# TEST 3: Critical telemetry
@patch("app.ai.agents.flood_detection_agent.get_ai_config")
@patch("app.ai.agents.flood_detection_agent.ChatGoogleGenerativeAI")
def test_flood_detection_critical(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    # Critical output mock
    mock_structured.invoke.return_value = FloodDetectionResult(
        risk_detected=True,
        status="CRITICAL",
        evidence=["Water level breached critical threshold of 4.2m"]
    )

    weather = {"location": "Visakhapatnam", "rainfall_mm": 150, "temperature_c": 25, "forecast": "storm"}
    telemetry = [{"node_name": "Drain Node 1", "value": 4.5, "unit": "m", "status": "critical", "source_type": "REAL_IOT"}]

    res = FloodDetectionAgent.run(weather, telemetry)
    assert res.risk_detected is True
    assert res.status == "CRITICAL"

# TEST 4: SIMULATED telemetry
@patch("app.ai.agents.flood_detection_agent.get_ai_config")
@patch("app.ai.agents.flood_detection_agent.ChatGoogleGenerativeAI")
def test_flood_detection_simulated_provenance(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = FloodDetectionResult(
        risk_detected=True,
        status="HIGH",
        evidence=["Telemetry indicates warning level", "Data provenance is SIMULATED"]
    )

    weather = {"location": "Visakhapatnam", "rainfall_mm": 80, "temperature_c": 27, "forecast": "rain"}
    telemetry = [{"node_name": "Drain Node 1", "value": 4.0, "unit": "m", "status": "warning", "source_type": "SIMULATED"}]

    res = FloodDetectionAgent.run(weather, telemetry)
    assert "SIMULATED" in res.evidence[1]

# TEST 5: REAL_IOT telemetry
@patch("app.ai.agents.flood_detection_agent.get_ai_config")
@patch("app.ai.agents.flood_detection_agent.ChatGoogleGenerativeAI")
def test_flood_detection_real_iot_provenance(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = FloodDetectionResult(
        risk_detected=True,
        status="CRITICAL",
        evidence=["Telemetry indicates critical level", "Data provenance is REAL_IOT"]
    )

    weather = {"location": "Visakhapatnam", "rainfall_mm": 90, "temperature_c": 27, "forecast": "rain"}
    telemetry = [{"node_name": "Drain Node 2", "value": 4.3, "unit": "m", "status": "critical", "source_type": "REAL_IOT"}]

    res = FloodDetectionAgent.run(weather, telemetry)
    assert "REAL_IOT" in res.evidence[1]

# TEST 6: Incomplete telemetry input checks
def test_flood_detection_incomplete_data():
    weather = {}
    telemetry = []

    # Should raise ValueError because inputs are empty
    with pytest.raises(ValueError, match="Missing weather data context"):
        FloodDetectionAgent.run(weather, telemetry)

    with pytest.raises(ValueError, match="Missing telemetry data context"):
        FloodDetectionAgent.run({"location": "Vizag"}, [])

# TEST 7: Malformed Gemini structured response
@patch("app.ai.agents.flood_detection_agent.get_ai_config")
@patch("app.ai.agents.flood_detection_agent.ChatGoogleGenerativeAI")
def test_flood_detection_malformed_response(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    # Mock structured response return value to be string instead of Pydantic model
    mock_structured.invoke.return_value = "malformed text output"

    weather = {"location": "Visakhapatnam", "rainfall_mm": 10, "temperature_c": 28, "forecast": "clear"}
    telemetry = [{"node_name": "Drain Node 1", "value": 1.0, "unit": "m", "status": "normal", "source_type": "SIMULATED"}]

    with pytest.raises(RuntimeError, match="Model output failed Pydantic validation"):
        FloodDetectionAgent.run(weather, telemetry)

# TEST 8: Missing API key fallback
@patch("app.ai.agents.flood_detection_agent.get_ai_config")
def test_flood_detection_missing_api_key(mock_config):
    # Setup mock key configuration
    mock_config.return_value = get_mock_config(key="mock_key")

    weather = {"location": "Visakhapatnam", "rainfall_mm": 10, "temperature_c": 28, "forecast": "clear"}
    telemetry = [{"node_name": "Drain Node 1", "value": 1.0, "unit": "m", "status": "normal", "source_type": "SIMULATED"}]

    with pytest.raises(RuntimeError, match="GEMINI_API_KEY NOT CONFIGURED"):
        FloodDetectionAgent.run(weather, telemetry)
