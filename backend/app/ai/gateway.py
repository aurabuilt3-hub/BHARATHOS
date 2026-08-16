import time
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.models import User
from app.ai.graph.orchestrator import LangGraphAIOrchestrator
from app.ai.memory.session_memory import session_memory_store
from app.core.logging import logger
from app.agents.tools import (
    get_weather as raw_get_weather,
    get_telemetry as raw_get_telemetry,
    get_incidents as raw_get_incidents,
    get_alerts as raw_get_alerts,
    get_available_resources as raw_get_available_resources,
    get_incident as raw_get_incident
)

def build_graph_inputs(db: Session, user: User, incident_description: str, incident_id: Optional[str] = None) -> Dict[str, Any]:
    # 1. Fetch incident details if incident_id is provided
    incident_dict = None
    if incident_id:
        try:
            raw_inc = raw_get_incident(db, user, incident_id)
            if raw_inc:
                incident_dict = {
                    "id": str(raw_inc.get("id")),
                    "title": raw_inc.get("title"),
                    "category": raw_inc.get("category"),
                    "description": raw_inc.get("description"),
                    "latitude": raw_inc.get("latitude"),
                    "longitude": raw_inc.get("longitude"),
                    "severity": raw_inc.get("priority", "medium")
                }
        except Exception as e:
            # Handle out of scope or not found error
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied or incident not found: {str(e)}"
            )
    else:
        # Fallback to creating a pseudo incident from the description
        incident_dict = {
            "title": "Incoming Signal",
            "category": "waterlogging",
            "description": incident_description,
            "latitude": 17.68,
            "longitude": 83.21,
            "severity": "medium"
        }

    # 2. Fetch context within operator scope
    # Weather
    weather = {}
    try:
        raw_w = raw_get_weather(db, user)
        weather = {
            "rainfall_24h_mm": raw_w.get("rainfall_24h_mm", 0.0),
            "temperature_celsius": raw_w.get("temperature_celsius", 28.0),
            "condition": raw_w.get("condition", "rain")
        }
    except Exception:
        pass

    # Telemetry
    telemetry = []
    try:
        raw_t = raw_get_telemetry(db, user)
        for r in raw_t[:30]:
            telemetry.append({
                "node_id": str(r.get("node_id")),
                "node_name": r.get("node_name"),
                "value": r.get("value"),
                "status": r.get("status")
            })
    except Exception:
        pass

    # Active incidents
    active_incidents = []
    if incident_dict:
        active_incidents.append(incident_dict)
    try:
        raw_ins = raw_get_incidents(db, user, status="open")
        for r in raw_ins[:30]:
            active_incidents.append({
                "id": str(r.get("id")),
                "title": r.get("title"),
                "category": r.get("category"),
                "description": r.get("description"),
                "latitude": r.get("latitude"),
                "longitude": r.get("longitude"),
                "severity": r.get("priority", "medium")
            })
    except Exception:
        pass

    # Active alerts
    active_alerts = []
    try:
        raw_al = raw_get_alerts(db, user)
        for r in raw_al[:30]:
            active_alerts.append({
                "id": str(r.get("id")),
                "title": r.get("title"),
                "severity": r.get("severity"),
                "status": r.get("status")
            })
    except Exception:
        pass

    # Available resources
    available_resources = []
    try:
        raw_res = raw_get_available_resources(db, user)
        for r in raw_res[:30]:
            available_resources.append({
                "id": str(r.get("id")),
                "name": r.get("name"),
                "type": r.get("type"),
                "status": r.get("status"),
                "latitude": r.get("latitude"),
                "longitude": r.get("longitude")
            })
    except Exception:
        pass

    # Determine event source/provenance from telemetry node if possible
    provenance = "SIMULATED"
    if telemetry:
        from app.models.models import DigitalTwinNode
        for t in telemetry:
            try:
                node = db.get(DigitalTwinNode, uuid.UUID(t["node_id"]))
                if node and node.last_telemetry:
                    if node.last_telemetry.get("source_type") == "REAL_IOT":
                        provenance = "REAL_IOT"
                        break
            except Exception:
                pass

    return {
        "event_source": provenance,
        "weather_context": weather,
        "telemetry_context": telemetry,
        "incident_context": active_incidents,
        "alert_context": active_alerts,
        "resource_context": available_resources
    }


class AIGateway:
    @staticmethod
    def process_triage_request(
        incident_description: str,
        db: Session,
        user: User,
        incident_id: Optional[str] = None,
        session_id: str = "default_session",
        max_retries: int = 2
    ) -> Dict[str, Any]:
        """
        AI Gateway central entrypoint executing LangGraph pipeline.
        """
        if not incident_description or len(incident_description.strip()) == 0:
            raise ValueError("Incident description cannot be empty.")

        # Save session context
        session_memory_store.set_session_data(session_id, "last_input", incident_description)

        attempts = 0
        last_error = None

        while attempts <= max_retries:
            try:
                logger.info(f"AI Gateway processing triage request (Attempt {attempts + 1}): '{incident_description[:40]}...'")
                
                # Build graph input context enforcing backend security/geographic limits
                inputs = build_graph_inputs(db, user, incident_description, incident_id)

                # Execute LangGraph pipeline
                state = LangGraphAIOrchestrator.run_triage_graph(inputs)

                if state.errors:
                    raise RuntimeError(f"LangGraph node execution failed: {state.errors[0]}")
                
                # Standardize output for TriageResponse
                severity_val = state.response_recommendation.severity if state.response_recommendation else "medium"
                recommended_action_val = state.response_recommendation.recommended_action if state.response_recommendation else "Awaiting manual triage."
                reasoning_val = "\n".join(state.response_recommendation.reasoning) if state.response_recommendation else "No reasoning available."
                
                evidence_val = ""
                if state.flood_detection:
                    evidence_val += f"Flood Detection: {', '.join(state.flood_detection.evidence)}\n"
                if state.risk_analysis:
                    evidence_val += f"Risk Level: {state.risk_analysis.risk_level}\n"

                missing_info = []
                if not state.weather_context:
                    missing_info.append("Weather context unavailable")
                if not state.telemetry_context:
                    missing_info.append("Telemetry metrics unavailable")

                cat = inputs["incident_context"][0].get("category", "") if inputs["incident_context"] else ""
                recommended_depts = []
                if "flood" in cat.lower() or "water" in cat.lower():
                    recommended_depts.append("Disaster Management")
                else:
                    recommended_depts.append("Emergency Services")

                # Embed structured information in metadata
                metadata = {
                    "completed": True,
                    "flood_detection": state.flood_detection.dict() if state.flood_detection else None,
                    "risk_analysis": state.risk_analysis.dict() if state.risk_analysis else None,
                    "incident_intelligence": state.incident_intelligence.dict() if state.incident_intelligence else None,
                    "resource_recommendation": state.resource_recommendation.dict() if state.resource_recommendation else None,
                    "response_recommendation": state.response_recommendation.dict() if state.response_recommendation else None,
                    "communication": state.communication.dict() if state.communication else None,
                    "errors": state.errors
                }

                return {
                    "summary": recommended_action_val,
                    "confidence": 90.0,
                    "reasoning": reasoning_val,
                    "evidence": evidence_val.strip(),
                    "assumptions": ["Telemetry provenance remains unchanged"],
                    "missing_information": missing_info,
                    "recommended_departments": recommended_depts,
                    "priority": severity_val.lower(),
                    "next_steps": [recommended_action_val],
                    "human_approval_required": True,
                    "status": "awaiting_human_approval",
                    "metadata": metadata
                }

            except HTTPException as he:
                raise he
            except Exception as e:
                attempts += 1
                last_error = e
                logger.warning(f"AI Gateway triage attempt {attempts} failed: {str(e)}")
                time.sleep(0.2)

        # Fallback response if max retries exceeded
        return {
            "summary": "AI Gateway operational fallback: Triage pipeline encountered temporary timeout.",
            "confidence": 50.0,
            "reasoning": f"Max retries ({max_retries}) reached. Error: {str(last_error)}",
            "evidence": "Gateway retry logs",
            "assumptions": ["Manual officer inspection required"],
            "missing_information": ["Full agent graph telemetry"],
            "recommended_departments": ["Disaster Management"],
            "priority": "high",
            "next_steps": ["1. Dispatch field officer to inspect site manually."],
            "human_approval_required": True,
            "status": "awaiting_human_approval",
            "metadata": {"gateway_fallback": True, "attempts": attempts}
        }

ai_gateway = AIGateway()
