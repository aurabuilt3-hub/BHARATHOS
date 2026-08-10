from sqlalchemy.orm import Session
from app.models.models import User
from app.agents.tools import get_alerts, get_alert_summary
from app.agents.schemas import AgentResponse

class AlertAgent:
    @staticmethod
    def run(db: Session, user: User, query: str) -> AgentResponse:
        # Fetch active alerts
        active_alerts = get_alerts(db, user, status="ACTIVE")
        summary = get_alert_summary(db, user)
        
        count = len(active_alerts)
        answer = f"Found {count} active emergency alerts in this region. Aggregated summary: {summary['total']} total, {summary['active']} active, {summary['critical']} critical."
        
        recommendations = []
        warnings = []
        sources = ["Alert Registry"]
        
        for al in active_alerts:
            if al["severity"].upper() == "CRITICAL":
                warnings.append(f"Critical Danger Warning: {al['title']} ({al['description']})")
                recommendations.append(f"Deploy emergency services to coordinate safety responses for: {al['title']}")
                
        if not recommendations:
            recommendations.append("Continue regular sensor polling and weather checks.")

        return AgentResponse(
            answer=answer,
            intent="alert_query",
            confidence=94.5,
            sources=sources,
            data=active_alerts,
            recommendations=recommendations,
            warnings=warnings
        )
