from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from app.ai.gateway import ai_gateway
from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.models import User
from sqlalchemy.orm import Session
from app.agents.schemas import AgentResponse
from app.agents.orchestrator import AIOrchestrator

router = APIRouter(prefix="/ai", tags=["Multi-Agent AI System"])

class TriageRequest(BaseModel):
    incident_description: str = Field(..., example="Heavy waterlogging on Beach Road MVP Colony near Sector 4.")
    session_id: Optional[str] = "default_session"

class TriageResponse(BaseModel):
    summary: str
    confidence: float
    reasoning: str
    evidence: str
    assumptions: List[str] = []
    missing_information: List[str] = []
    recommended_departments: List[str]
    priority: str
    next_steps: List[str]
    human_approval_required: bool = True
    status: str
    metadata: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str = Field(..., example="What is the available ICU bed capacity in Visakhapatnam hospitals?")
    history: Optional[List[Dict[str, str]]] = None

@router.post("/triage", response_model=TriageResponse)
def run_ai_triage(request: TriageRequest):
    try:
        recommendation = ai_gateway.process_triage_request(
            incident_description=request.incident_description,
            session_id=request.session_id or "default_session"
        )
        return TriageResponse(**recommendation)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Gateway processing failed: {str(e)}"
        )

@router.post("/chat", response_model=AgentResponse)
def handle_ai_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return AIOrchestrator.run(
            db=db,
            user=current_user,
            message=request.message,
            history=request.history
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Orchestrator failed: {str(e)}"
        )
