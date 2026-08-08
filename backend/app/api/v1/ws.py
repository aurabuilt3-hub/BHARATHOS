import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.realtime.connection_manager import connection_manager

router = APIRouter(prefix="/ws", tags=["Realtime WebSockets"])

@router.websocket("/dashboard")
async def ws_dashboard(websocket: WebSocket):
    await connection_manager.connect("dashboard", websocket)
    try:
        while True:
            # Heartbeat ping loop
            await websocket.send_json({"type": "ping", "data": connection_manager.get_stats()})
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        connection_manager.disconnect("dashboard", websocket)

@router.websocket("/incidents")
async def ws_incidents(websocket: WebSocket):
    await connection_manager.connect("incidents", websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connection_manager.disconnect("incidents", websocket)

@router.websocket("/sensors")
async def ws_sensors(websocket: WebSocket):
    await connection_manager.connect("sensors", websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connection_manager.disconnect("sensors", websocket)

@router.websocket("/notifications")
async def ws_notifications(websocket: WebSocket):
    await connection_manager.connect("notifications", websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connection_manager.disconnect("notifications", websocket)

@router.get("/monitor")
def get_realtime_system_monitor():
    return connection_manager.get_stats()
