import asyncio
from fastapi import WebSocket
from app.realtime.metrics import metrics_tracker

class HeartbeatHandler:
    @staticmethod
    async def run_heartbeat_loop(websocket: WebSocket, interval_seconds: int = 15):
        while True:
            await asyncio.sleep(interval_seconds)
            try:
                await websocket.send_json({
                    "type": "heartbeat_ping",
                    "timestamp": asyncio.get_event_loop().time()
                })
                metrics_tracker.record_message_sent()
            except Exception:
                break

heartbeat_handler = HeartbeatHandler()
