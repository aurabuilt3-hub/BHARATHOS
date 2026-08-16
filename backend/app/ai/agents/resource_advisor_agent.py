import os
from typing import Dict, Any, List, Optional, Union
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.ai.config import get_ai_config
from app.ai.schemas.agent_outputs import ResourceRecommendation
from app.ai.graph.tools import validate_resource_recommendation

class ResourceAdvisorAgent:
    @staticmethod
    def run(
        incident: Dict[str, Any],
        available_resources: List[Dict[str, Any]],
        risk_analysis_result: Optional[Dict[str, Any]] = None,
        flood_detection_result: Optional[Dict[str, Any]] = None,
        incident_intelligence_result: Optional[Dict[str, Any]] = None,
        nearby_facilities: Optional[List[Dict[str, Any]]] = None,
        provenance: Optional[str] = None
    ) -> ResourceRecommendation:
        """
        AI Resource Advisor Agent.
        Recommends the best available emergency resource to dispatch for a flood incident.
        """
        # Validate inputs
        if not incident:
            raise ValueError("Missing incident context.")
        if available_resources is None:
            raise ValueError("Missing available resources candidate dataset.")

        # Extract incident category, coordinates, severity, etc.
        category = incident.get("category")
        severity = incident.get("severity")
        lat = incident.get("latitude")
        lon = incident.get("longitude")

        if not category:
            raise ValueError("Missing incident category.")
        if not severity:
            raise ValueError("Missing incident severity.")
        if lat is None or lon is None:
            raise ValueError("Missing incident geographic coordinates.")

        config = get_ai_config()
        api_key = config.get("api_key")

        # Check API key config
        if not api_key or api_key == "mock_key":
            raise RuntimeError("GEMINI_API_KEY NOT CONFIGURED")

        # Compile incoming report context
        evidence_lines = []
        evidence_lines.append("INCIDENT DETAILS:")
        evidence_lines.append(f"Title: {incident.get('title')}")
        evidence_lines.append(f"Category: {category}")
        evidence_lines.append(f"Severity: {severity}")
        evidence_lines.append(f"Coordinates: lat={lat}, lon={lon}")
        evidence_lines.append(f"Description: {incident.get('description')}")
        if provenance:
            evidence_lines.append(f"Data Provenance: {provenance}")

        evidence_lines.append("\nAVAILABLE RESOURCES FOR ALLOCATION:")
        for res in available_resources:
            evidence_lines.append(
                f"- ID: {res.get('id')}, Type: {res.get('type') or res.get('resource_type')}, Name: {res.get('name')}, "
                f"Coordinates: lat={res.get('latitude')}, lon={res.get('longitude')}, "
                f"Status: {res.get('status')}, Capabilities: {res.get('capabilities') or 'General Response'}"
            )

        if nearby_facilities:
            evidence_lines.append("\nNEARBY FACILITIES (Context only - NOT deployable):")
            for fac in nearby_facilities:
                evidence_lines.append(f"- Name: {fac.get('name')}, Type: {fac.get('facility_type')}, Coordinates: lat={fac.get('latitude')}, lon={fac.get('longitude')}")

        context_str = "\n".join(evidence_lines)

        # Initialize the model
        model = ChatGoogleGenerativeAI(
            model=config.get("model", "gemini-3.6-flash"),
            google_api_key=api_key,
            temperature=config.get("temperature", 0.2),
            timeout=config.get("timeout", 30.0)
        )

        # Bind structured output
        structured_model = model.with_structured_output(ResourceRecommendation)

        system_prompt = (
            "You are the BHARATOS Resource Advisor Agent.\n"
            "Your job is to recommend the single most appropriate available resource for the active incident.\n"
            "Prefer resources that match requirements (e.g. water rescue for critical floods, pumps for waterlogging, response team for blockages).\n"
            "Prefer geographically closer resources based on coordinate distance. If coordinates are missing, use other metadata.\n"
            "Do not recommend already allocated or unavailable resources. Do not treat facilities as deployable assets.\n"
            "Rely strictly on the provided evidence. Do not invent any sensor readings, locations, incidents, or resource actions.\n"
            "Decline to perform any operational dispatch, write actions, or database modification. Your output is advisory only.\n"
            "Always preserve telemetry/report source provenance when reviewing evidence.\n"
            "Select the resource ID from the supplied available resources and explain your choice in the reason field."
        )

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"EVIDENCE CONTEXT:\n{context_str}\n\nRecommend the best available resource now.")
        ]

        try:
            result = structured_model.invoke(messages)
            if not isinstance(result, ResourceRecommendation):
                raise ValueError("Model output failed Pydantic validation.")
        except Exception as e:
            # Re-raise standard exception to be handled by caller
            raise RuntimeError(f"Gemini API call failed: {str(e)}")

        # Validate ID against available resources
        if result.recommended_resource_id:
            validated_id, reason_adj = validate_resource_recommendation(
                result.recommended_resource_id,
                available_resources
            )
            if not validated_id:
                raise ValueError(f"Resource recommendation rejected: {reason_adj}")

        return result
