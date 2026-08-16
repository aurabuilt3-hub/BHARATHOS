import os
from typing import Dict, Any, List, Optional, Union
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.ai.config import get_ai_config
from app.ai.schemas.agent_outputs import IncidentIntelligenceResult

class IncidentIntelligenceAgent:
    @staticmethod
    def run(
        incoming_incident: Dict[str, Any],
        active_incidents: List[Dict[str, Any]],
        active_alerts: Optional[List[Dict[str, Any]]] = None,
        telemetry_context: Optional[List[Dict[str, Any]]] = None,
        flood_detection_result: Optional[Dict[str, Any]] = None,
        risk_analysis_result: Optional[Dict[str, Any]] = None,
        provenance: Optional[str] = None
    ) -> IncidentIntelligenceResult:
        """
        AI Incident Intelligence Agent.
        Compares an incoming report against active incidents to detect duplicates.
        """
        # Validate inputs
        if not incoming_incident:
            raise ValueError("Missing incoming incident report context.")
        if active_incidents is None:
            raise ValueError("Missing active incidents candidate dataset.")

        # Extract coordinates, description, category, etc.
        category = incoming_incident.get("category")
        title = incoming_incident.get("title")
        description = incoming_incident.get("description")
        lat = incoming_incident.get("latitude")
        lon = incoming_incident.get("longitude")

        if not category:
            raise ValueError("Missing incident category.")
        if description is None:
            raise ValueError("Missing incident description.")
        if lat is None or lon is None:
            raise ValueError("Missing incident geographic coordinates.")

        config = get_ai_config()
        api_key = config.get("api_key")

        # Check API key config
        if not api_key or api_key == "mock_key":
            raise RuntimeError("GEMINI_API_KEY NOT CONFIGURED")

        # Compile incoming report context
        evidence_lines = []
        evidence_lines.append("INCOMING REPORT:")
        evidence_lines.append(f"Title: {title}")
        evidence_lines.append(f"Category: {category}")
        evidence_lines.append(f"Description: {description}")
        evidence_lines.append(f"Coordinates: lat={lat}, lon={lon}")
        evidence_lines.append(f"Severity: {incoming_incident.get('severity')}")
        if provenance:
            evidence_lines.append(f"Data Provenance: {provenance}")

        evidence_lines.append("\nCANDIDATE ACTIVE INCIDENTS:")
        for inc in active_incidents:
            evidence_lines.append(
                f"- ID: {inc.get('id')}, Category: {inc.get('category')}, Title: {inc.get('title')}, "
                f"Description: {inc.get('description')}, Coordinates: lat={inc.get('latitude')}, lon={inc.get('longitude')}, "
                f"Status: {inc.get('status')}, Severity: {inc.get('severity')}"
            )

        if active_alerts:
            evidence_lines.append("\nACTIVE ALERTS IN AREA:")
            for al in active_alerts:
                evidence_lines.append(f"- Title: {al.get('title')}, Severity: {al.get('severity')}")

        if telemetry_context:
            evidence_lines.append("\nTELEMETRY CONTEXT:")
            for tc in telemetry_context:
                evidence_lines.append(f"- Node: {tc.get('node_name')}, Value: {tc.get('value')}, Status: {tc.get('status')}")

        context_str = "\n".join(evidence_lines)

        # Initialize the model
        model = ChatGoogleGenerativeAI(
            model=config.get("model", "gemini-3.6-flash"),
            google_api_key=api_key,
            temperature=config.get("temperature", 0.2),
            timeout=config.get("timeout", 30.0)
        )

        # Bind structured output
        structured_model = model.with_structured_output(IncidentIntelligenceResult)

        system_prompt = (
            "You are the BHARATOS Incident Intelligence Agent.\n"
            "Your job is to compare an incoming report against the candidate list of active incidents and determine if it is a duplicate.\n"
            "Analyze proximity (lat/lon coordinates), category matches, temporal clues, and semantic description details.\n"
            "Rely strictly on the provided evidence. Do not invent any sensor readings, locations, incidents, or resource actions.\n"
            "Decline to perform any operational dispatch, write actions, or database modification.\n"
            "Always preserve telemetry/report source provenance when reviewing evidence.\n"
            "If it matches an existing active incident, set is_duplicate to true and matching_incident_id to the exact candidate ID. "
            "Otherwise, set is_duplicate to false and matching_incident_id to null."
        )

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"EVIDENCE CONTEXT:\n{context_str}\n\nAssess incident deduplication now.")
        ]

        try:
            result = structured_model.invoke(messages)
            if not isinstance(result, IncidentIntelligenceResult):
                raise ValueError("Model output failed Pydantic validation.")

            # Strict candidate ID validation
            if result.is_duplicate and result.matching_incident_id:
                active_ids = {str(inc.get("id")) for inc in active_incidents}
                if str(result.matching_incident_id) not in active_ids:
                    result.matching_incident_id = None

            return result
        except Exception as e:
            # Re-raise standard exception to be handled by caller
            raise RuntimeError(f"Gemini API call failed: {str(e)}")
