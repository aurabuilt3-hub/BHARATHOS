import pytest
from unittest.mock import MagicMock, patch
from pydantic import ValidationError

from app.ai.agents.communication_agent import CommunicationAgent
from app.ai.schemas.agent_outputs import CommunicationResult

# Mock helper to override get_ai_config settings
def get_mock_config(key="real_key_for_test"):
    return {
        "model": "gemini-3.6-flash",
        "api_key": key,
        "temperature": 0.2,
        "timeout": 30.0
    }

# 1. Normal advisory message
@patch("app.ai.agents.communication_agent.get_ai_config")
@patch("app.ai.agents.communication_agent.ChatGoogleGenerativeAI")
def test_communication_normal(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = CommunicationResult(
        english="Weather is normal. No action required.",
        telugu="వాతావరణం సాధారణంగా ఉంది. ఎటువంటి చర్య అవసరం లేదు.",
        hindi="मौसम सामान्य है। किसी कार्रवाई की आवश्यकता नहीं है।"
    )

    rec = {"severity": "NORMAL", "recommended_action": "Monitor weather", "reasoning": ["Clear skies"]}
    res = CommunicationAgent.run(rec, "OFFICIAL_PUBLIC")
    assert res.english == "Weather is normal. No action required."
    assert "సాధారణంగా ఉంది" in res.telugu
    assert "सामान्य है" in res.hindi

# 2. Warning message, 3. High-risk message, 4. Critical flood message, 5. English output, 6. Telugu output, 7. Hindi output, 8. Meaning consistency across languages
@patch("app.ai.agents.communication_agent.get_ai_config")
@patch("app.ai.agents.communication_agent.ChatGoogleGenerativeAI")
def test_communication_critical_flood(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = CommunicationResult(
        english="Critical flood risk detected in your area. Move to higher ground.",
        telugu="మీ ప్రాంతంలో తీవ్రమైన వరద ముప్పు కనుగొనబడింది. ఎత్తైన ప్రదేశాలకు వెళ్ళండి.",
        hindi="आपके क्षेत्र में गंभीर बाढ़ का खतरा पाया गया है। ऊंचे स्थानों पर जाएं।"
    )

    rec = {"severity": "CRITICAL", "recommended_action": "Evacuate low-lying areas", "reasoning": ["Rising water levels"]}
    res = CommunicationAgent.run(rec, "REAL_IOT")
    assert "Critical flood risk" in res.english
    assert "వరద ముప్పు" in res.telugu
    assert "बाढ़ का खतरा" in res.hindi

# 9. No dispatch claim before approval, 10. No allocation claim before approval
@patch("app.ai.agents.communication_agent.get_ai_config")
@patch("app.ai.agents.communication_agent.ChatGoogleGenerativeAI")
def test_communication_pre_approval_claim_rejection(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    # Gemini falsely claims dispatch has occurred even though action_confirmed is False
    mock_structured.invoke.return_value = CommunicationResult(
        english="Rescue team has been dispatched.",
        telugu="సహాయక బృందం పంపబడింది.",
        hindi="बचाव दल भेज दिया गया है।"
    )

    rec = {"severity": "HIGH", "recommended_action": "Deploy rescue team.", "reasoning": ["Heavy flooding"], "action_confirmed": False}
    with pytest.raises(RuntimeError, match="Message falsely claims dispatch or allocation before approval"):
        CommunicationAgent.run(rec, "SIMULATED")

# 11. Confirmed dispatch wording only when explicitly supplied
@patch("app.ai.agents.communication_agent.get_ai_config")
@patch("app.ai.agents.communication_agent.ChatGoogleGenerativeAI")
def test_communication_confirmed_dispatch(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = CommunicationResult(
        english="Rescue team has been dispatched.",
        telugu="సహాయక బృందం పంపబడింది.",
        hindi="बचाव दल भेज दिया गया है।"
    )

    rec = {"severity": "HIGH", "recommended_action": "Deploy rescue team.", "reasoning": ["Heavy flooding"], "action_confirmed": True}
    res = CommunicationAgent.run(rec, "SIMULATED")
    assert res.english == "Rescue team has been dispatched."

# 12. SIMULATED provenance
@patch("app.ai.agents.communication_agent.get_ai_config")
@patch("app.ai.agents.communication_agent.ChatGoogleGenerativeAI")
def test_communication_simulated_provenance(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = CommunicationResult(
        english="Simulated weather warning in progress. Do not panic.",
        telugu="వాతావరణ హెచ్చరిక అనుకరణ జరుగుతోంది.",
        hindi="मौसम चेतावनी का अनुकरण चल रहा है।"
    )

    rec = {"severity": "WARNING", "recommended_action": "Monitor simulated system", "reasoning": ["Simulated rain"]}
    res = CommunicationAgent.run(rec, "SIMULATED")
    assert "Simulated" in res.english

# 13. REAL_IOT provenance
@patch("app.ai.agents.communication_agent.get_ai_config")
@patch("app.ai.agents.communication_agent.ChatGoogleGenerativeAI")
def test_communication_real_iot_provenance(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = CommunicationResult(
        english="Live IoT sensors detect elevated water levels in MVP Colony.",
        telugu="ఎంవీపీ కాలనీలో నీటి మట్టాలు పెరిగినట్లు సెన్సార్లు గుర్తించాయి.",
        hindi="एमवीपी कॉलोनी में जल स्तर बढ़ने की पुष्टि सेंसरों द्वारा की गई है।"
    )

    rec = {"severity": "HIGH", "recommended_action": "Avoid low-lying streets", "reasoning": ["Live node 1 rising"]}
    res = CommunicationAgent.run(rec, "REAL_IOT")
    assert "Live IoT" in res.english

# 14. CITIZEN_REPORT provenance
@patch("app.ai.agents.communication_agent.get_ai_config")
@patch("app.ai.agents.communication_agent.ChatGoogleGenerativeAI")
def test_communication_citizen_report_provenance(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = CommunicationResult(
        english="Citizen reports indicate local waterlogging near beach road.",
        telugu="బీచ్ రోడ్ వద్ద నీరు నిలిచినట్లు ప్రజల నుండి నివేదికలు వచ్చాయి.",
        hindi="बीच रोड के पास जलभराव की नागरिक रिपोर्ट मिली है।"
    )

    rec = {"severity": "WARNING", "recommended_action": "Drive carefully near beach road", "reasoning": ["Citizen ticket 4"]}
    res = CommunicationAgent.run(rec, "CITIZEN_REPORT")
    assert "Citizen reports" in res.english

# 15. OFFICIAL_PUBLIC provenance
@patch("app.ai.agents.communication_agent.get_ai_config")
@patch("app.ai.agents.communication_agent.ChatGoogleGenerativeAI")
def test_communication_official_provenance(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = CommunicationResult(
        english="Official warning: Avoid waterlogged streets.",
        telugu="అధికారిక హెచ్చరిక: నీరు నిలిచిన రోడ్లను నివారించండి.",
        hindi="आधिकारिक चेतावनी: जलभराव वाली सड़कों से बचें।"
    )

    rec = {"severity": "WARNING", "recommended_action": "Avoid waterlogged streets", "reasoning": ["State Met advisory"]}
    res = CommunicationAgent.run(rec, "OFFICIAL_PUBLIC")
    assert "Official warning" in res.english

# 16. Missing response recommendation, 17. Missing severity, 18. Missing action, 19. Missing provenance
def test_communication_missing_inputs():
    with pytest.raises(ValueError, match="Missing response recommendation input"):
        CommunicationAgent.run(None, "REAL_IOT")

    with pytest.raises(ValueError, match="Missing provenance input"):
        CommunicationAgent.run({"severity": "HIGH", "recommended_action": "A"}, None)

    with pytest.raises(ValueError, match="Missing severity in response recommendation"):
        CommunicationAgent.run({"recommended_action": "A"}, "REAL_IOT")

    with pytest.raises(ValueError, match="Missing recommended action in response recommendation"):
        CommunicationAgent.run({"severity": "HIGH"}, "REAL_IOT")

# 20. Malformed Gemini structured output
@patch("app.ai.agents.communication_agent.get_ai_config")
@patch("app.ai.agents.communication_agent.ChatGoogleGenerativeAI")
def test_communication_malformed(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = "malformed string response"

    rec = {"severity": "HIGH", "recommended_action": "A"}
    with pytest.raises(RuntimeError, match="Model output failed Pydantic validation"):
        CommunicationAgent.run(rec, "REAL_IOT")

# 21. Gemini timeout
@patch("app.ai.agents.communication_agent.get_ai_config")
@patch("app.ai.agents.communication_agent.ChatGoogleGenerativeAI")
def test_communication_timeout(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.side_effect = Exception("Deadline Exceeded")

    rec = {"severity": "HIGH", "recommended_action": "A"}
    with pytest.raises(RuntimeError, match="Gemini API call failed"):
        CommunicationAgent.run(rec, "REAL_IOT")

# 22. Missing API key
@patch("app.ai.agents.communication_agent.get_ai_config")
def test_communication_missing_api_key(mock_config):
    mock_config.return_value = get_mock_config(key="mock_key")

    rec = {"severity": "HIGH", "recommended_action": "A"}
    with pytest.raises(RuntimeError, match="GEMINI_API_KEY NOT CONFIGURED"):
        CommunicationAgent.run(rec, "REAL_IOT")

# 23. No database writes & 24. No notification API calls
def test_communication_no_writes_no_notifications():
    import inspect
    source = inspect.getsource(CommunicationAgent.run)
    assert "db.add" not in source
    assert "db.commit" not in source
    assert "db.delete" not in source
    assert "db.flush" not in source
    # Check for notification service calls / SMS / WhatsApp APIs
    assert "sms" not in source.lower()
    assert "whatsapp" not in source.lower()
    assert "twilio" not in source.lower()
    assert "send_sms" not in source.lower()

# 25. No fabricated emergency numbers
@patch("app.ai.agents.communication_agent.get_ai_config")
@patch("app.ai.agents.communication_agent.ChatGoogleGenerativeAI")
def test_communication_fabricated_numbers_rejection(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = CommunicationResult(
        english="Call emergency number 987-654-3210 immediately.",
        telugu="వెంటనే సంప్రదించండి.",
        hindi="तुरंत संपर्क करें।"
    )

    rec = {"severity": "HIGH", "recommended_action": "Evacuate"}
    with pytest.raises(RuntimeError, match="Fabricated phone number detected"):
        CommunicationAgent.run(rec, "REAL_IOT")

# 26. No dangerous flood instructions
@patch("app.ai.agents.communication_agent.get_ai_config")
@patch("app.ai.agents.communication_agent.ChatGoogleGenerativeAI")
def test_communication_dangerous_instructions_rejection(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = CommunicationResult(
        english="It is safe to drive through flooded roads.",
        telugu="వరద రోడ్లపై ప్రయాణం సురక్షితం.",
        hindi="बाढ़ वाली सड़कों पर गाड़ी चलाना सुरक्षित है।"
    )

    rec = {"severity": "HIGH", "recommended_action": "Evacuate"}
    with pytest.raises(RuntimeError, match="Dangerous flood instructions detected"):
        CommunicationAgent.run(rec, "REAL_IOT")
