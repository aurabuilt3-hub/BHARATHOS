import os
from typing import Dict, Any, List, Optional, Union
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.ai.config import get_ai_config
from app.ai.schemas.agent_outputs import ResponseRecommendation
from app.ai.graph.tools import validate_resource_recommendation

class ResponseAdvisorAgent:
    @staticmethod
    def run(
        flood_detection: Dict[str, Any],
        risk_analysis: Dict[str, Any],
        incident_intelligence: Dict[str, Any],
        resource_recommendation: Dict[str, Any],
        available_resources: List[Dict[str, Any]],
        incident: Optional[Dict[str, Any]] = None,
        active_alerts: Optional[List[Dict[str, Any]]] = None,
        weather: Optional[Dict[str, Any]] = None,
        telemetry: Optional[List[Dict[str, Any]]] = None,
        provenance: Optional[str] = None
    ) -> ResponseRecommendation:
        """
        AI Response Advisor Agent.
        Synthesizes upstream agent results to generate a final emergency response recommendation.
        """
        # Validate inputs
        if not flood_detection:
            raise ValueError("Missing flood detection upstream output.")
        if not risk_analysis:
            raise ValueError("Missing risk analysis upstream output.")
        if not incident_intelligence:
            raise ValueError("Missing incident intelligence upstream output.")
        if not resource_recommendation:
            raise ValueError("Missing resource recommendation upstream output.")
        if available_resources is None:
            raise ValueError("Missing available resources dataset.")

        config = get_ai_config()
        api_key = config.get("api_key")

        # Check API key config
        if not api_key or api_key == "mock_key":
            raise RuntimeError("GEMINI_API_KEY NOT CONFIGURED")

        # Compile incoming report context
        evidence_lines = []
        evidence_lines.append("UPSTREAM AGENT RESULTS:")
        evidence_lines.append(f"Flood Detection: {flood_detection}")
        evidence_lines.append(f"Risk Analysis: {risk_analysis}")
        evidence_lines.append(f"Incident Intelligence: {incident_intelligence}")
        evidence_lines.append(f"Resource Recommendation: {resource_recommendation}")

        if incident:
            evidence_lines.append("\nINCIDENT CONTEXT:")
            evidence_lines.append(f"Title: {incident.get('title')}")
            evidence_lines.append(f"Category: {incident.get('category')}")
            evidence_lines.append(f"Severity: {incident.get('severity')}")
            evidence_lines.append(f"Description: {incident.get('description')}")
            evidence_lines.append(f"Coordinates: lat={incident.get('latitude')}, lon={incident.get('longitude')}")

        if provenance:
            evidence_lines.append(f"Data Provenance: {provenance}")

        evidence_lines.append("\nTRUSTED AVAILABLE RESOURCES:")
        for res in available_resources:
            evidence_lines.append(f"- ID: {res.get('id')}, Type: {res.get('type')}, Name: {res.get('name')}")

        context_str = "\n".join(evidence_lines)

        # Initialize the model
        model = ChatGoogleGenerativeAI(
            model=config.get("model", "gemini-3.6-flash"),
            google_api_key=api_key,
            temperature=config.get("temperature", 0.2),
            timeout=config.get("timeout", 30.0)
        )

        # Bind structured output
        structured_model = model.with_structured_output(ResponseRecommendation)

        system_prompt = (
            "You are the BHARATOS Response Advisor Agent.\n"
            "Your job is to synthesize the upstream results from Flood Detection, Risk Analysis, "
            "Incident Intelligence, and Resource Recommendation to formulate a single cohesive operational recommendation.\n"
            "Answer 'What should the operator consider doing next?' by combining the evidence.\n"
            "Use only the severity levels: NORMAL, WATCH, WARNING, HIGH, CRITICAL.\n"
            "Rely strictly on the provided evidence. Do not invent any sensor readings, locations, incidents, or resource actions.\n"
            "Decline to perform any operational dispatch, write actions, or database modification. Your output is advisory only.\n"
            "Always preserve telemetry/report source provenance when reviewing evidence.\n"
            "Extract the recommended resource ID from the resource recommendation. "
            "Explain your synthesis logic in the reasoning array and state the overall severity and recommended action."
        )

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"EVIDENCE CONTEXT:\n{context_str}\n\nSynthesize the response recommendation now.")
        ]

        try:
            result = structured_model.invoke(messages)
            if not isinstance(result, ResponseRecommendation):
                raise ValueError("Model output failed Pydantic validation.")

            # Force requires_human_approval to True (although schema validator does it, we enforce here)
            result.requires_human_approval = True

            # Validate resource_id against available resources
            if result.resource_id:
                validated_id, reason_adj = validate_resource_recommendation(
                    result.resource_id,
                    available_resources
                )
                if not validated_id:
                    result.resource_id = None
                    result.reasoning.append("Warning: Recommended resource ID was rejected because it does not exist in the available assets database or is out of scope.")

            return result
        except Exception as e:
            # Re-raise standard exception to be handled by caller
            raise RuntimeError(f"Gemini API call failed: {str(e)}")
