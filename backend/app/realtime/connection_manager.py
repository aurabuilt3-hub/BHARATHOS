from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps topic name -> list of active WebSocket client connections
        self.active_connections: Dict[str, List[WebSocket]] = {
            "dashboard": [],
            "incidents": [],
            "sensors": [],
            "notifications": []
        }
        self.total_messages_sent: int = 0

    async def connect(self, topic: str, websocket: WebSocket):
        await websocket.accept()
        if topic not in self.active_connections:
            self.active_connections[topic] = []
        self.active_connections[topic].append(websocket)

    def disconnect(self, topic: str, websocket: WebSocket):
        if topic in self.active_connections and websocket in self.active_connections[topic]:
            self.active_connections[topic].remove(websocket)

    async def broadcast(self, topic: str, message: dict):
        if topic in self.active_connections:
            for connection in self.active_connections[topic]:
                try:
                    await connection.send_json(message)
                    self.total_messages_sent += 1
                except Exception:
                    pass

    def get_stats(self) -> dict:
        client_count = sum(len(conns) for conns in self.active_connections.values())
        return {
            "connected_clients": client_count,
            "messages_sent": self.total_messages_sent,
            "topics": {topic: len(conns) for topic, conns in self.active_connections.items()}
        }

connection_manager = ConnectionManager()
