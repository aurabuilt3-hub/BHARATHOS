from sqlalchemy.orm import Session
from app.models.models import User
from app.agents.tools import get_incidents
from app.agents.schemas import AgentResponse

class IncidentAgent:
    @staticmethod
    def run(db: Session, user: User, query: str) -> AgentResponse:
        # Retrieve incidents matching the query/intent within scope
        incidents = get_incidents(db, user)
        active_incidents = [inc for inc in incidents if inc["status"] != "resolved"]
        
        # Format fact & recommendation
        count = len(active_incidents)
        answer = f"Found {count} active incidents in your authorized geographic scope."
        
        sources = ["Incident Registry"]
        recommendations = []
        warnings = []
        
        if count > 0:
            recommendations.append("Prioritize dispatching response teams to active incident tickets.")
            for inc in active_incidents:
                if inc["priority"] == "critical":
                    warnings.append(f"Critical Incident Alert: {inc['title']} requires immediate attention.")
        else:
            recommendations.append("Continue standard municipal monitoring.")

        # Flag simulated data
        for inc in active_incidents:
            if inc["source_type"] == "SIMULATED":
                sources.append("SIMULATED Incident Data")
                break

        return AgentResponse(
            answer=answer,
            intent="incident_query",
            confidence=95.0,
            sources=list(set(sources)),
            data=active_incidents,
            recommendations=recommendations,
            warnings=warnings
        )
