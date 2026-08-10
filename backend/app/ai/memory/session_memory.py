from typing import Dict, Any, Optional

class SessionMemory:
    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}

    def set_session_data(self, session_id: str, key: str, value: Any) -> None:
        if session_id not in self._store:
            self._store[session_id] = {}
        self._store[session_id][key] = value

    def get_session_data(self, session_id: str, key: str) -> Optional[Any]:
        return self._store.get(session_id, {}).get(key)

session_memory_store = SessionMemory()
