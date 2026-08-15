import random
import asyncio
import uuid
import logging
from datetime import datetime
from sqlalchemy.orm.attributes import flag_modified

from app.db.session import SessionLocal
from app.models.models import TelemetryRecord, DigitalTwinNode
from app.services.alert_rule_service import AlertRuleService
from app.realtime.event_service import event_service

logger = logging.getLogger("app.simulation")

class SensorEngine:
    def __init__(self):
        self.water_level: float = 4.15
        self.node_id = uuid.UUID("847ac10b-58cc-4372-a567-0e02b2c3d486") # Beach Road Storm Drain Gauge

    async def run_simulation_loop(self):
        """Periodically fluctuates IoT water gauge readings, saves to DB, evaluates alerts, and broadcasts via WebSockets."""
        while True:
            await asyncio.sleep(4.0) # Fluctuate reading every 4 seconds
            
            db = SessionLocal()
            try:
                # Random walk simulation
                delta = random.choice([-0.05, -0.02, 0.03, 0.06])
                self.water_level = round(max(3.5, min(4.6, self.water_level + delta)), 2)
                
                status = "critical" if self.water_level >= 4.2 else "warning" if self.water_level >= 4.0 else "normal"
                
                # Fetch node from DB
                node = db.query(DigitalTwinNode).filter(DigitalTwinNode.id == self.node_id).first()
                if node:
                    # Update node status & cached telemetry
                    node.status = status
                    current_telemetry = dict(node.last_telemetry or {})
                    current_telemetry.update({
                        "water_level": self.water_level,
                        "unit": "m"
                    })
                    node.last_telemetry = current_telemetry
                    flag_modified(node, "last_telemetry")
                    
                    # Create Telemetry Record
                    rec = TelemetryRecord(
                        id=uuid.uuid4(),
                        node_id=node.id,
                        metric_type="water_level",
                        value=self.water_level,
                        unit="m",
                        status=status,
                        timestamp=datetime.utcnow()
                    )
                    db.add(rec)
                    db.flush()
                    
                    # Evaluate threshold rules and generate alert if breached
                    alert = AlertRuleService.evaluate_telemetry(db, rec)
                    
                    # Commit transaction first (committed state safety!)
                    db.commit()
                    db.refresh(rec)
                    db.refresh(node)
                    if alert:
                        db.refresh(alert)
                    
                    # Publish events to WebSockets
                    await event_service.publish_telemetry_updated(db, rec, node)
                    await event_service.publish_node_updated(db, node)
                    if alert:
                        await event_service.publish_alert_created(db, alert)
                        
            except Exception as e:
                db.rollback()
                logger.error(f"Error in sensor simulation loop: {str(e)}")
            finally:
                db.close()

sensor_engine = SensorEngine()
