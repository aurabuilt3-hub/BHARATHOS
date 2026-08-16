import os
from typing import Dict, Any, List, Optional, Union
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.ai.config import get_ai_config
from app.ai.schemas.agent_outputs import RiskAnalysisResult, FloodDetectionResult

class RiskAnalysisAgent:
    @staticmethod
    def run(
        weather_data: Dict[str, Any],
        telemetry_data: List[Dict[str, Any]],
        flood_detection_result: Optional[Union[FloodDetectionResult, Dict[str, Any]]] = None,
        active_incidents: Optional[List[Dict[str, Any]]] = None,
        active_alerts: Optional[List[Dict[str, Any]]] = None
    ) -> RiskAnalysisResult:
        """
        AI Risk Analysis Agent.
        Analyzes weather, telemetry, flood detection results, active incidents, and active alerts to assess overall risk level.
        """
        # Validate inputs
        if weather_data is None:
            raise ValueError("Missing weather data context.")
        if telemetry_data is None:
            raise ValueError("Missing telemetry data context.")

        config = get_ai_config()
        api_key = config.get("api_key")

        # Check API key config
        if not api_key or api_key == "mock_key":
            raise RuntimeError("GEMINI_API_KEY NOT CONFIGURED")

        # Compile evidence context string
        evidence_lines = []
        evidence_lines.append(f"Weather: location={weather_data.get('location')}, rainfall={weather_data.get('rainfall_mm')}mm, temp={weather_data.get('temperature_c')}C, forecast={weather_data.get('forecast')}")

        for r in telemetry_data:
            evidence_lines.append(f"Telemetry: node_name={r.get('node_name')}, value={r.get('value')}{r.get('unit')}, status={r.get('status')}, provenance={r.get('source_type')}")

        if flood_detection_result:
            if isinstance(flood_detection_result, FloodDetectionResult):
                det_dict = flood_detection_result.model_dump()
            else:
                det_dict = flood_detection_result
            evidence_lines.append(f"Flood Detection Agent Output: risk_detected={det_dict.get('risk_detected')}, status={det_dict.get('status')}, evidence={det_dict.get('evidence')}")

        if active_incidents:
            for inc in active_incidents:
                evidence_lines.append(f"Incident: title={inc.get('title')}, status={inc.get('status')}, severity={inc.get('severity')}")

        if active_alerts:
            for al in active_alerts:
                evidence_lines.append(f"Alert: title={al.get('title')}, status={al.get('status')}, severity={al.get('severity')}")

        context_str = "\n".join(evidence_lines)

        # Initialize the model
        model = ChatGoogleGenerativeAI(
            model=config.get("model", "gemini-3.6-flash"),
            google_api_key=api_key,
            temperature=config.get("temperature", 0.2),
            timeout=config.get("timeout", 30.0)
        )

        # Bind structured output
        structured_model = model.with_structured_output(RiskAnalysisResult)

        system_prompt = (
            "You are the BHARATOS Risk Analysis Agent.\n"
            "Your job is to analyze the supplied operational evidence (weather, telemetry, incidents, alerts, detection results) and determine the overall flood risk level.\n"
            "You must rely strictly on the provided evidence. Do not invent any sensor readings, locations, or incidents.\n"
            "Allowed risk levels: LOW, MEDIUM, HIGH, CRITICAL.\n"
            "Decline to make any operational dispatch decisions. Your recommendation is strictly advisory.\n"
            "Always preserve telemetry provenance (SIMULATED or REAL_IOT) when referencing evidence.\n"
            "Ensure you explain why you selected the level, identify the primary environmental/meteorological risk drivers, and recommend what should be monitored."
        )

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"OPERATIONAL EVIDENCE:\n{context_str}\n\nAssess risk level now.")
        ]

        try:
            result = structured_model.invoke(messages)
            if not isinstance(result, RiskAnalysisResult):
                raise ValueError("Model output failed Pydantic validation.")
            return result
        except Exception as e:
            # Re-raise standard exception to be handled by caller
            raise RuntimeError(f"Gemini API call failed: {str(e)}")
