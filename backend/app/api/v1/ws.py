import asyncio
import uuid
import logging
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Query
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.dependencies.auth import supabase_client
from app.models.models import User
from app.realtime.connection_manager import connection_manager, ActiveConnection

router = APIRouter(prefix="/ws", tags=["Realtime WebSockets"])
logger = logging.getLogger("app.realtime")

async def authenticate_ws(websocket: WebSocket, token: Optional[str], db: Session) -> Optional[User]:
    if not token:
        await websocket.accept()
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Missing token query parameter.")
        return None
    try:
        user_response = supabase_client.auth.get_user(token)
        if not user_response or not user_response.user:
            await websocket.accept()
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token credentials.")
            return None
        user_uuid = uuid.UUID(user_response.user.id)
        db_user = db.query(User).filter(User.id == user_uuid).first()
        if not db_user:
            await websocket.accept()
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="User profile not registered.")
            return None
        await websocket.accept()
        return db_user
    except Exception as e:
        logger.error(f"WebSocket auth exception: {str(e)}")
        try:
            await websocket.accept()
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=f"Authentication failed: {str(e)}")
        except Exception:
            pass
        return None

@router.websocket("/dashboard")
async def ws_dashboard(websocket: WebSocket, token: Optional[str] = Query(None)):
    db = SessionLocal()
    try:
        user = await authenticate_ws(websocket, token, db)
        if not user:
            return
        
        role_name = user.role.role_name if user.role else "citizen"
        active_conn = ActiveConnection(
            websocket=websocket,
            user_id=user.id,
            role_name=role_name,
            state_id=user.state_id,
            district_id=user.district_id,
            city_id=user.city_id
        )
    finally:
        db.close()

    await connection_manager.connect("dashboard", active_conn)
    try:
        while True:
            # Heartbeat ping / keepalive message exchange
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        connection_manager.disconnect("dashboard", websocket)
    except Exception:
        connection_manager.disconnect("dashboard", websocket)

@router.websocket("/incidents")
async def ws_incidents(websocket: WebSocket, token: Optional[str] = Query(None)):
    db = SessionLocal()
    try:
        user = await authenticate_ws(websocket, token, db)
        if not user:
            return
        
        role_name = user.role.role_name if user.role else "citizen"
        active_conn = ActiveConnection(
            websocket=websocket,
            user_id=user.id,
            role_name=role_name,
            state_id=user.state_id,
            district_id=user.district_id,
            city_id=user.city_id
        )
    finally:
        db.close()

    await connection_manager.connect("incidents", active_conn)
    try:
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        connection_manager.disconnect("incidents", websocket)
    except Exception:
        connection_manager.disconnect("incidents", websocket)

@router.websocket("/sensors")
async def ws_sensors(websocket: WebSocket, token: Optional[str] = Query(None)):
    db = SessionLocal()
    try:
        user = await authenticate_ws(websocket, token, db)
        if not user:
            return
        
        role_name = user.role.role_name if user.role else "citizen"
        active_conn = ActiveConnection(
            websocket=websocket,
            user_id=user.id,
            role_name=role_name,
            state_id=user.state_id,
            district_id=user.district_id,
            city_id=user.city_id
        )
    finally:
        db.close()

    await connection_manager.connect("sensors", active_conn)
    try:
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        connection_manager.disconnect("sensors", websocket)
    except Exception:
        connection_manager.disconnect("sensors", websocket)

@router.websocket("/notifications")
async def ws_notifications(websocket: WebSocket, token: Optional[str] = Query(None)):
    db = SessionLocal()
    try:
        user = await authenticate_ws(websocket, token, db)
        if not user:
            return
        
        role_name = user.role.role_name if user.role else "citizen"
        active_conn = ActiveConnection(
            websocket=websocket,
            user_id=user.id,
            role_name=role_name,
            state_id=user.state_id,
            district_id=user.district_id,
            city_id=user.city_id
        )
    finally:
        db.close()

    await connection_manager.connect("notifications", active_conn)
    try:
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        connection_manager.disconnect("notifications", websocket)
    except Exception:
        connection_manager.disconnect("notifications", websocket)

@router.get("/monitor")
def get_realtime_system_monitor():
    return connection_manager.get_stats()
