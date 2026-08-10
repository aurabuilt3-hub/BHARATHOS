import random
import asyncio
from datetime import datetime
from app.realtime.connection_manager import connection_manager
from app.realtime.notification_service import notification_service

class SensorEngine:
    def __init__(self):
        self.water_level: float = 4.15

    async def run_simulation_loop(self):
        """Periodically fluctuates IoT water gauge readings and broadcasts telemetry over WebSockets."""
        while True:
            await asyncio.sleep(4.0) # Broadcast telemetry every 4 seconds
            # Random walk simulation
            delta = random.choice([-0.05, -0.02, 0.03, 0.06])
            self.water_level = round(max(3.5, min(4.6, self.water_level + delta)), 2)

            status = "critical" if self.water_level >= 4.2 else "warning" if self.water_level >= 4.0 else "normal"

            payload = {
                "event": "sensor_updated",
                "sensor_id": "sns-1",
                "name": "Ward 12 Storm Drain Gauge",
                "reading": self.water_level,
                "unit": "m",
                "status": status,
                "timestamp": datetime.utcnow().strftime("%H:%M:%S")
            }

            # Broadcast over /ws/sensors
            await connection_manager.broadcast("sensors", payload)

            # Trigger critical alert notification if water breaches 4.2m
            if status == "critical" and random.random() < 0.3:
                await notification_service.broadcast_notification(
                    title="Critical Water Surge Alarm",
                    body=f"Ward 12 Storm Drain Gauge breached safety threshold at {self.water_level}m!",
                    priority="critical",
                    category="sensor"
                )

sensor_engine = SensorEngine()
