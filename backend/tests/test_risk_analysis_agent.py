import pytest
from unittest.mock import MagicMock, patch
from app.ai.agents.risk_analysis_agent import RiskAnalysisAgent
from app.ai.schemas.agent_outputs import RiskAnalysisResult, FloodDetectionResult

# Mock helper to override get_ai_config settings
def get_mock_config(key="real_key_for_test"):
    return {
        "model": "gemini-3.6-flash",
        "api_key": key,
        "temperature": 0.2,
        "timeout": 30.0
    }

# 1. LOW risk scenario
@patch("app.ai.agents.risk_analysis_agent.get_ai_config")
@patch("app.ai.agents.risk_analysis_agent.ChatGoogleGenerativeAI")
def test_risk_analysis_low(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = RiskAnalysisResult(
        risk_level="LOW",
        drivers=["Minimal rainfall"],
        evidence=["Weather is clear, telemetry is stable"],
        recommended_monitoring=["Routine sensor checks"]
    )

    weather = {"location": "Visakhapatnam", "rainfall_mm": 0, "temperature_c": 28, "forecast": "clear"}
    telemetry = [{"node_name": "Drain Node 1", "value": 1.0, "unit": "m", "status": "normal", "source_type": "SIMULATED"}]

    res = RiskAnalysisAgent.run(weather, telemetry)
    assert res.risk_level == "LOW"
    assert "Minimal rainfall" in res.drivers

# 2. MEDIUM risk scenario
@patch("app.ai.agents.risk_analysis_agent.get_ai_config")
@patch("app.ai.agents.risk_analysis_agent.ChatGoogleGenerativeAI")
def test_risk_analysis_medium(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = RiskAnalysisResult(
        risk_level="MEDIUM",
        drivers=["Moderate rainfall"],
        evidence=["Steady rain reported, water level elevated but steady"],
        recommended_monitoring=["Monitor downstream outfall levels"]
    )

    weather = {"location": "Visakhapatnam", "rainfall_mm": 35, "temperature_c": 27, "forecast": "rain"}
    telemetry = [{"node_name": "Drain Node 1", "value": 2.2, "unit": "m", "status": "warning", "source_type": "SIMULATED"}]

    res = RiskAnalysisAgent.run(weather, telemetry)
    assert res.risk_level == "MEDIUM"

# 3. HIGH risk scenario
@patch("app.ai.agents.risk_analysis_agent.get_ai_config")
@patch("app.ai.agents.risk_analysis_agent.ChatGoogleGenerativeAI")
def test_risk_analysis_high(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = RiskAnalysisResult(
        risk_level="HIGH",
        drivers=["Heavy rainfall", "Rising outfall gauge"],
        evidence=["Rainfall at 95mm, telemetry warning level"],
        recommended_monitoring=["Emergency services alert standby"]
    )

    weather = {"location": "Visakhapatnam", "rainfall_mm": 95, "temperature_c": 26, "forecast": "heavy_rain"}
    telemetry = [{"node_name": "Drain Node 1", "value": 3.9, "unit": "m", "status": "warning", "source_type": "SIMULATED"}]

    res = RiskAnalysisAgent.run(weather, telemetry)
    assert res.risk_level == "HIGH"

# 4. CRITICAL risk scenario
@patch("app.ai.agents.risk_analysis_agent.get_ai_config")
@patch("app.ai.agents.risk_analysis_agent.ChatGoogleGenerativeAI")
def test_risk_analysis_critical(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = RiskAnalysisResult(
        risk_level="CRITICAL",
        drivers=["Torrential rain", "Critical water level breach"],
        evidence=["Rainfall at 160mm, water level 4.6m"],
        recommended_monitoring=["Immediate command center dispatch trigger"]
    )

    weather = {"location": "Visakhapatnam", "rainfall_mm": 160, "temperature_c": 25, "forecast": "storm"}
    telemetry = [{"node_name": "Drain Node 1", "value": 4.6, "unit": "m", "status": "critical", "source_type": "REAL_IOT"}]

    res = RiskAnalysisAgent.run(weather, telemetry)
    assert res.risk_level == "CRITICAL"

# 5. Heavy rainfall + rising water level
@patch("app.ai.agents.risk_analysis_agent.get_ai_config")
@patch("app.ai.agents.risk_analysis_agent.ChatGoogleGenerativeAI")
def test_risk_analysis_heavy_rain_rising(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = RiskAnalysisResult(
        risk_level="HIGH",
        drivers=["Heavy rainfall of 110mm", "Water level rising on critical gauge"],
        evidence=["Observed high intensity rainfall"],
        recommended_monitoring=["Continuous drainage outfall logs"]
    )

    weather = {"location": "Visakhapatnam", "rainfall_mm": 110, "temperature_c": 26, "forecast": "heavy_rain"}
    telemetry = [{"node_name": "Gate 4 Gauge", "value": 4.1, "unit": "m", "status": "warning", "source_type": "REAL_IOT"}]

    res = RiskAnalysisAgent.run(weather, telemetry)
    assert res.risk_level == "HIGH"

# 6. Stable telemetry despite rainfall
@patch("app.ai.agents.risk_analysis_agent.get_ai_config")
@patch("app.ai.agents.risk_analysis_agent.ChatGoogleGenerativeAI")
def test_risk_analysis_stable_despite_rain(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = RiskAnalysisResult(
        risk_level="MEDIUM",
        drivers=["Significant rain", "Infiltration capacity normal"],
        evidence=["Rainfall at 60mm but water gauge remains at stable 1.0m"],
        recommended_monitoring=["Monitor downstream discharge rates"]
    )

    weather = {"location": "Visakhapatnam", "rainfall_mm": 60, "temperature_c": 27, "forecast": "rain"}
    telemetry = [{"node_name": "Gate 4 Gauge", "value": 1.0, "unit": "m", "status": "normal", "source_type": "SIMULATED"}]

    res = RiskAnalysisAgent.run(weather, telemetry)
    assert res.risk_level == "MEDIUM"

# 7. SIMULATED provenance
@patch("app.ai.agents.risk_analysis_agent.get_ai_config")
@patch("app.ai.agents.risk_analysis_agent.ChatGoogleGenerativeAI")
def test_risk_analysis_simulated_provenance(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = RiskAnalysisResult(
        risk_level="MEDIUM",
        drivers=["Rainfall in area"],
        evidence=["Simulated telemetry indicates elevated risk"],
        recommended_monitoring=["Routine simulation checks"]
    )

    weather = {"location": "Visakhapatnam", "rainfall_mm": 45, "temperature_c": 27, "forecast": "rain"}
    telemetry = [{"node_name": "Drain Node 1", "value": 2.5, "unit": "m", "status": "warning", "source_type": "SIMULATED"}]

    res = RiskAnalysisAgent.run(weather, telemetry)
    assert "Simulated" in res.evidence[0]

# 8. REAL_IOT provenance
@patch("app.ai.agents.risk_analysis_agent.get_ai_config")
@patch("app.ai.agents.risk_analysis_agent.ChatGoogleGenerativeAI")
def test_risk_analysis_real_iot_provenance(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = RiskAnalysisResult(
        risk_level="HIGH",
        drivers=["Rainfall in area"],
        evidence=["Real IoT telemetry indicates critical water logging"],
        recommended_monitoring=["Command center dispatcher notification"]
    )

    weather = {"location": "Visakhapatnam", "rainfall_mm": 95, "temperature_c": 26, "forecast": "heavy_rain"}
    telemetry = [{"node_name": "Drain Node 2", "value": 4.3, "unit": "m", "status": "critical", "source_type": "REAL_IOT"}]

    res = RiskAnalysisAgent.run(weather, telemetry)
    assert "Real IoT" in res.evidence[0]

# 9. Missing weather data & 10. Missing telemetry data
def test_risk_analysis_missing_data():
    weather = {}
    telemetry = []

    with pytest.raises(ValueError, match="Missing weather data context"):
        RiskAnalysisAgent.run(None, telemetry)

    with pytest.raises(ValueError, match="Missing telemetry data context"):
        RiskAnalysisAgent.run(weather, None)

# 11. Missing FloodDetectionResult
@patch("app.ai.agents.risk_analysis_agent.get_ai_config")
@patch("app.ai.agents.risk_analysis_agent.ChatGoogleGenerativeAI")
def test_risk_analysis_missing_detection_result(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = RiskAnalysisResult(
        risk_level="LOW",
        drivers=["Clear skies"],
        evidence=["Analyzed without detection agent result"],
        recommended_monitoring=["Routine checks"]
    )

    weather = {"location": "Visakhapatnam", "rainfall_mm": 0, "temperature_c": 28, "forecast": "clear"}
    telemetry = [{"node_name": "Drain Node 1", "value": 1.0, "unit": "m", "status": "normal", "source_type": "SIMULATED"}]

    # Should run successfully even with flood_detection_result=None
    res = RiskAnalysisAgent.run(weather, telemetry, flood_detection_result=None)
    assert res.risk_level == "LOW"

# 12. Malformed structured output
@patch("app.ai.agents.risk_analysis_agent.get_ai_config")
@patch("app.ai.agents.risk_analysis_agent.ChatGoogleGenerativeAI")
def test_risk_analysis_malformed_response(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = "invalid unstructured text string output"

    weather = {"location": "Visakhapatnam", "rainfall_mm": 10, "temperature_c": 28, "forecast": "clear"}
    telemetry = [{"node_name": "Drain Node 1", "value": 1.0, "unit": "m", "status": "normal", "source_type": "SIMULATED"}]

    with pytest.raises(RuntimeError, match="Model output failed Pydantic validation"):
        RiskAnalysisAgent.run(weather, telemetry)

# 13. Gemini timeout
@patch("app.ai.agents.risk_analysis_agent.get_ai_config")
@patch("app.ai.agents.risk_analysis_agent.ChatGoogleGenerativeAI")
def test_risk_analysis_gemini_timeout(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    # Mock timeout exception during invocation
    mock_structured.invoke.side_effect = Exception("Deadline Exceeded / Timeout")

    weather = {"location": "Visakhapatnam", "rainfall_mm": 10, "temperature_c": 28, "forecast": "clear"}
    telemetry = [{"node_name": "Drain Node 1", "value": 1.0, "unit": "m", "status": "normal", "source_type": "SIMULATED"}]

    with pytest.raises(RuntimeError, match="Gemini API call failed"):
        RiskAnalysisAgent.run(weather, telemetry)

# 14. Missing API key
@patch("app.ai.agents.risk_analysis_agent.get_ai_config")
def test_risk_analysis_missing_api_key(mock_config):
    mock_config.return_value = get_mock_config(key="mock_key")

    weather = {"location": "Visakhapatnam", "rainfall_mm": 10, "temperature_c": 28, "forecast": "clear"}
    telemetry = [{"node_name": "Drain Node 1", "value": 1.0, "unit": "m", "status": "normal", "source_type": "SIMULATED"}]

    with pytest.raises(RuntimeError, match="GEMINI_API_KEY NOT CONFIGURED"):
        RiskAnalysisAgent.run(weather, telemetry)

# 15. No database write operations
def test_risk_analysis_no_write_operations():
    # Verify the agent does not import or use any mutating functions on standard models.
    # It must be purely analytical.
    import inspect
    source = inspect.getsource(RiskAnalysisAgent.run)
    assert "db.add" not in source
    assert "db.commit" not in source
    assert "db.delete" not in source
    assert "db.flush" not in source
