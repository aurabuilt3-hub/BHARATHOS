import os
from typing import Dict, Any, List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.ai.config import get_ai_config
from app.ai.schemas.agent_outputs import FloodDetectionResult

class FloodDetectionAgent:
    @staticmethod
    def run(
        weather_data: Dict[str, Any],
        telemetry_data: List[Dict[str, Any]],
        active_incidents: Optional[List[Dict[str, Any]]] = None
    ) -> FloodDetectionResult:
        """
        AI Flood Detection Agent.
        Analyzes weather, rainfall, telemetry, and incident context to assess developing flood conditions.
        """
        # Validate inputs
        if not weather_data:
            raise ValueError("Missing weather data context.")
        if not telemetry_data:
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
            
        if active_incidents:
            for inc in active_incidents:
                evidence_lines.append(f"Incident: title={inc.get('title')}, status={inc.get('status')}, severity={inc.get('severity')}")
                
        context_str = "\n".join(evidence_lines)

        # Initialize the model
        model = ChatGoogleGenerativeAI(
            model=config.get("model", "gemini-3.6-flash"),
            google_api_key=api_key,
            temperature=config.get("temperature", 0.2),
            timeout=config.get("timeout", 30.0)
        )
        
        # Bind structured output
        structured_model = model.with_structured_output(FloodDetectionResult)
        
        system_prompt = (
            "You are the BHARATOS Flood Detection Agent.\n"
            "Your job is to analyze the supplied operational evidence (weather, telemetry, incidents) and determine if developing flood conditions are present.\n"
            "You must rely strictly on the provided evidence. Do not invent any sensor readings, locations, or incidents.\n"
            "Decline to make any operational dispatch decisions. Your recommendation is strictly analytical.\n"
            "Always preserve telemetry provenance (SIMULATED or REAL_IOT) when referencing evidence."
        )
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"OPERATIONAL EVIDENCE:\n{context_str}\n\nAssess flood conditions now.")
        ]
        
        try:
            result = structured_model.invoke(messages)
            if not isinstance(result, FloodDetectionResult):
                raise ValueError("Model output failed Pydantic validation.")
            return result
        except Exception as e:
            # Re-raise standard exception to be handled by caller
            raise RuntimeError(f"Gemini API call failed: {str(e)}")
