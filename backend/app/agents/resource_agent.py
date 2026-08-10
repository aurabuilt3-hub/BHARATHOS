from sqlalchemy.orm import Session
from app.models.models import User
from app.agents.tools import get_available_resources
from app.agents.schemas import AgentResponse

class ResourceAgent:
    @staticmethod
    def run(db: Session, user: User, query: str) -> AgentResponse:
        # Fetch available resources in user scope
        res_list = get_available_resources(db, user)
        
        # Format response
        count = len(res_list)
        answer = f"There are {count} emergency resources currently available."
        
        recommendations = []
        warnings = []
        sources = ["Resource Management Service"]
        
        if count > 0:
            # Recommend the first available resource as a candidate
            first_res = res_list[0]
            recommendations.append(f"Consider deploying {first_res['name']} ({first_res['type']}) which is currently available.")
        else:
            warnings.append("No emergency resources are currently available in the selected region.")
            recommendations.append("Request backup units from adjacent zones/cities.")

        return AgentResponse(
            answer=answer,
            intent="resource_query",
            confidence=93.0,
            sources=sources,
            data=res_list,
            recommendations=recommendations,
            warnings=warnings
        )
