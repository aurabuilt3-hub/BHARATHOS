import os
import re
from typing import Dict, Any, List, Optional, Union
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.ai.config import get_ai_config
from app.ai.schemas.agent_outputs import CommunicationResult

class CommunicationAgent:
    @staticmethod
    def run(
        response_recommendation: Dict[str, Any],
        provenance: str,
        incident_location: Optional[Dict[str, Any]] = None,
        incident_category: Optional[str] = None,
        relevant_risk_level: Optional[str] = None,
        safety_instructions: Optional[List[str]] = None
    ) -> CommunicationResult:
        """
        AI Multilingual Communication Agent.
        Translates an operational emergency recommendation into concise citizen-facing messages.
        """
        # Validate inputs
        if not response_recommendation:
            raise ValueError("Missing response recommendation input.")
        if provenance is None:
            raise ValueError("Missing provenance input.")

        severity = response_recommendation.get("severity")
        recommended_action = response_recommendation.get("recommended_action")

        if not severity:
            raise ValueError("Missing severity in response recommendation.")
        if not recommended_action:
            raise ValueError("Missing recommended action in response recommendation.")

        config = get_ai_config()
        api_key = config.get("api_key")

        # Check API key config
        if not api_key or api_key == "mock_key":
            raise RuntimeError("GEMINI_API_KEY NOT CONFIGURED")

        # Compile operational context
        evidence_lines = []
        evidence_lines.append("OPERATIONAL RECOMMENDATION:")
        evidence_lines.append(f"Severity: {severity}")
        evidence_lines.append(f"Recommended Action: {recommended_action}")
        evidence_lines.append(f"Reasoning: {response_recommendation.get('reasoning', [])}")
        evidence_lines.append(f"Data Provenance: {provenance}")
        if incident_category:
            evidence_lines.append(f"Incident Category: {incident_category}")
        if relevant_risk_level:
            evidence_lines.append(f"Relevant Risk Level: {relevant_risk_level}")
        if safety_instructions:
            evidence_lines.append(f"Safety Instructions: {safety_instructions}")

        context_str = "\n".join(evidence_lines)

        # Initialize the model
        model = ChatGoogleGenerativeAI(
            model=config.get("model", "gemini-3.6-flash"),
            google_api_key=api_key,
            temperature=0.2,
            timeout=30.0
        )

        # Bind structured output
        structured_model = model.with_structured_output(CommunicationResult)

        system_prompt = (
            "You are the BHARATOS Multilingual Communication Agent.\n"
            "Your job is to translate the operational emergency recommendation into clear, concise, multilingual public safety advisories.\n"
            "Generate identical messages in three languages: English, Telugu, and Hindi.\n"
            "Keep the messages short, clear, actionable, and appropriate for ordinary citizens.\n"
            "Avoid database IDs, resource IDs, model confidence scores, or technical telemetry values.\n"
            "Never claim a resource has been dispatched or allocated unless the recommended action explicitly states it is ALREADY CONFIRMED or DISPATCHED.\n"
            "If it is still a recommendation awaiting operator review, state that 'authorities are assessing the situation' or 'follow local guidelines'.\n"
            "Never claim official authorities have confirmed the situation unless the provenance is OFFICIAL_PUBLIC.\n"
            "Never claim live sensors detected flooding unless provenance is REAL_IOT.\n"
            "For SIMULATED provenance, do not state that physical deployment has occurred.\n"
            "Do not recommend dangerous instructions (e.g. entering floodwater, driving through flooded roads, touching electrical equipment).\n"
            "Do not fabricate emergency numbers.\n"
            "Populate english, telugu, and hindi fields. Do not leave any field empty."
        )

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"EVIDENCE CONTEXT:\n{context_str}\n\nGenerate multilingual advisory now.")
        ]

        try:
            result = structured_model.invoke(messages)
            if not isinstance(result, CommunicationResult):
                raise ValueError("Model output failed Pydantic validation.")

            # Strict Python validation checks
            for lang in ["english", "telugu", "hindi"]:
                val = getattr(result, lang, "")
                if not val or not val.strip():
                    raise ValueError(f"Empty message content for language {lang}")

                lower_val = val.lower()
                
                # Check for dangerous instructions
                if any(x in lower_val for x in ["drive through", "enter floodwater", "touch electrical", "walk through"]):
                    raise ValueError(f"Dangerous flood instructions detected in {lang} message.")

                # Check for fabricated emergency numbers (e.g. 10-digit numbers, etc.)
                if re.search(r"\b\d{10}\b|\b\d{3}-\d{3}-\d{4}\b", val):
                    raise ValueError(f"Fabricated phone number detected in {lang} message.")

                # Check if it falsely claims dispatch before approval
                is_confirmed = response_recommendation.get("action_confirmed", False)
                if not is_confirmed:
                    if any(x in lower_val for x in ["has been dispatched", "dispatched", "has been allocated", "allocated"]):
                        raise ValueError(f"Message falsely claims dispatch or allocation before approval in {lang}.")

            return result
        except Exception as e:
            # Re-raise standard exception to be handled by caller
            raise RuntimeError(f"Gemini API call failed: {str(e)}")
