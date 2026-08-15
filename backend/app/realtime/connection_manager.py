import uuid
import logging
from typing import Dict, List, Any, Optional
from fastapi import WebSocket

logger = logging.getLogger("app.realtime")

class ActiveConnection:
    def __init__(
        self, 
        websocket: WebSocket, 
        user_id: uuid.UUID, 
        role_name: str, 
        state_id: Optional[uuid.UUID], 
        district_id: Optional[uuid.UUID], 
        city_id: Optional[uuid.UUID]
    ):
        self.websocket = websocket
        self.user_id = user_id
        self.role_name = role_name
        self.state_id = state_id
        self.district_id = district_id
        self.city_id = city_id

class ConnectionManager:
    def __init__(self):
        # Maps topic name -> list of ActiveConnection
        self.active_connections: Dict[str, List[ActiveConnection]] = {
            "dashboard": [],
            "incidents": [],
            "sensors": [],
            "notifications": []
        }
        self.total_messages_sent: int = 0

    async def connect(self, topic: str, active_conn: ActiveConnection):
        if topic not in self.active_connections:
            self.active_connections[topic] = []
        self.active_connections[topic].append(active_conn)

    def disconnect(self, topic: str, websocket: WebSocket):
        if topic in self.active_connections:
            self.active_connections[topic] = [
                conn for conn in self.active_connections[topic] if conn.websocket != websocket
            ]

    async def broadcast(self, topic: str, message: dict, db: Optional[Any] = None):
        """
        Broadcasts message to all clients subscribed to a topic,
        applying geographic scope constraints based on user credentials.
        """
        if topic not in self.active_connections:
            return

        # Extract target geography scope from message
        geography = message.get("geography", {})
        target_state_id = uuid.UUID(geography.get("state_id")) if geography.get("state_id") else None
        target_district_id = uuid.UUID(geography.get("district_id")) if geography.get("district_id") else None
        target_city_id = uuid.UUID(geography.get("city_id")) if geography.get("city_id") else None

        for conn in self.active_connections[topic]:
            # Perform geographic scope check
            if not self._check_geographic_scope(conn, target_state_id, target_district_id, target_city_id, db):
                # User is not authorized to receive this event
                continue

            try:
                await conn.websocket.send_json(message)
                self.total_messages_sent += 1
            except Exception as e:
                logger.debug(f"Failed to send websocket message: {str(e)}")
                pass

    def _check_geographic_scope(
        self, 
        conn: ActiveConnection, 
        target_state_id: Optional[uuid.UUID], 
        target_district_id: Optional[uuid.UUID], 
        target_city_id: Optional[uuid.UUID],
        db: Optional[Any] = None
    ) -> bool:
        # Re-use scope logic structure
        if conn.role_name in ("national_admin", "admin"):
            return True

        if conn.role_name == "citizen":
            return False

        user_state_id = conn.state_id
        user_district_id = conn.district_id
        user_city_id = conn.city_id

        # Resolve user's explicit city/district/state fallbacks if db is provided
        from app.models.models import City
        if user_city_id and db and not (user_state_id and user_district_id):
            city = db.query(City).filter(City.id == user_city_id).first()
            if city:
                if not user_district_id:
                    user_district_id = city.district_id
                if not user_state_id and city.district:
                    user_state_id = city.district.state_id

        # If resource targets a specific city:
        if target_city_id:
            if user_city_id:
                return user_city_id == target_city_id
            if user_district_id and db:
                city = db.query(City).filter(City.id == target_city_id).first()
                return city is not None and city.district_id == user_district_id
            if user_state_id and db:
                city = db.query(City).filter(City.id == target_city_id).first()
                return city is not None and city.district is not None and city.district.state_id == user_state_id
            return False

        # If resource targets a specific district:
        if target_district_id:
            if user_city_id:
                return False
            if user_district_id:
                return user_district_id == target_district_id
            if user_state_id and db:
                from app.models.models import District
                district = db.query(District).filter(District.id == target_district_id).first()
                return district is not None and district.state_id == user_state_id
            return False

        # If resource targets a specific state:
        if target_state_id:
            if user_city_id or user_district_id:
                return False
            if user_state_id:
                return user_state_id == target_state_id
            return False

        return True

    def get_stats(self) -> dict:
        client_count = sum(len(conns) for conns in self.active_connections.values())
        return {
            "connected_clients": client_count,
            "messages_sent": self.total_messages_sent,
            "topics": {topic: len(conns) for topic, conns in self.active_connections.items()}
        }

connection_manager = ConnectionManager()
