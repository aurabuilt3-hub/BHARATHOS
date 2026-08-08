from typing import Dict, Any, List

class IncidentMemory:
    def __init__(self):
        self._history: Dict[str, List[Dict[str, Any]]] = {}

    def record_agent_output(self, incident_id: str, agent_result: Dict[str, Any]) -> None:
        if incident_id not in self._history:
            self._history[incident_id] = []
        self._history[incident_id].append(agent_result)

    def get_incident_history(self, incident_id: str) -> List[Dict[str, Any]]:
        return self._history.get(incident_id, [])

incident_memory_store = IncidentMemory()
