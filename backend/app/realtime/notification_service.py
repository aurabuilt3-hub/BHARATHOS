import uuid
from datetime import datetime
from typing import Dict, Any
from app.realtime.connection_manager import connection_manager

class NotificationService:
    @staticmethod
    async def broadcast_notification(
        title: str,
        body: str,
        priority: str = "high",
        category: str = "alert"
    ) -> Dict[str, Any]:
        notification = {
            "id": str(uuid.uuid4()),
            "title": title,
            "body": body,
            "priority": priority,
            "category": category,
            "read": False,
            "timestamp": datetime.utcnow().strftime("%H:%M:%S")
        }
        await connection_manager.broadcast("notifications", notification)
        return notification

notification_service = NotificationService()
