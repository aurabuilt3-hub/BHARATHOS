from typing import Dict, Any
from app.ai.agents.agents import CoordinatorAgent

class LangGraphAIOrchestrator:
    @staticmethod
    def run_triage_graph(incident_description: str) -> Dict[str, Any]:
        """
        Executes the LangGraph Multi-Agent State Graph pipeline:
        Citizen -> Coordinator -> Sub-Agents (Weather, Traffic, Healthcare, Emergency, Analytics) -> Coordinator Merged Output.
        """
        result = CoordinatorAgent.synthesize(incident_description)
        return result
