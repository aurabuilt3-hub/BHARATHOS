from sqlalchemy.orm import Session
from app.models.models import User
from app.agents.tools import get_incidents, get_alerts, get_available_resources, get_facilities, get_telemetry
from app.agents.schemas import AgentResponse

class IntelligenceAgent:
    @staticmethod
    def run(db: Session, user: User, query: str) -> AgentResponse:
        # Retrieve context from multiple domains
        incidents = get_incidents(db, user)
        active_incidents = [i for i in incidents if i["status"] != "resolved"]
        
        alerts = get_alerts(db, user, status="ACTIVE")
        resources = get_available_resources(db, user)
        facilities = get_facilities(db, user)
        telemetry = get_telemetry(db, user)
        
        # Combine statistics
        answer = (
            f"Situational Overview: {len(active_incidents)} active incidents, "
            f"{len(alerts)} active alerts, {len(resources)} resources available, "
            f"and {len(facilities)} verified emergency facilities resolved in your scope."
        )
        
        recommendations = []
        warnings = []
        sources = ["Incident Registry", "Alert Registry", "Resource Service", "Facility Directory"]
        
        # Inspect for anomalies or priority actions
        for al in alerts:
            if al["severity"].upper() == "CRITICAL":
                warnings.append(f"Critical Danger: {al['title']}")
                recommendations.append(f"Act on critical alert: {al['title']}")
                
        for inc in active_incidents:
            if inc["priority"].upper() == "CRITICAL":
                warnings.append(f"Critical Incident: {inc['title']}")
                recommendations.append(f"Deploy nearest resources to active critical incident: {inc['title']}")
                
        # Highlight telemetry anomalies
        for tel in telemetry:
            if tel["status"] in ("critical", "warning"):
                warnings.append(f"Sensor Anomaly: {tel['metric_type']} is '{tel['status']}' at node '{tel['node_name']}' ({tel['value']}{tel['unit'] or ''})")
                recommendations.append(f"Inspect drainage sensor '{tel['node_name']}'")

        if not recommendations:
            recommendations.append("All operations running normally. Continue monitoring.")

        return AgentResponse(
            answer=answer,
            intent="situational_awareness",
            confidence=97.5,
            sources=list(set(sources)),
            data={
                "active_incidents_count": len(active_incidents),
                "active_alerts_count": len(alerts),
                "resources_available_count": len(resources),
                "facilities_count": len(facilities),
                "telemetry_anomalies_count": len([t for t in telemetry if t["status"] in ("critical", "warning")]),
            },
            recommendations=recommendations,
            warnings=warnings
        )
