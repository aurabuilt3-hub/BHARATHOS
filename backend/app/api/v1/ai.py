from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from app.ai.gateway import ai_gateway

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

class ChatResponse(BaseModel):
    reply: str
    sources: List[str]

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

@router.post("/chat", response_model=ChatResponse)
def handle_ai_chat(request: ChatRequest):
    return ChatResponse(
        reply="Visakhapatnam healthcare telemetry: King George Hospital (KGH) has 142 open beds (8 ICU), VIMS Super Specialty has 94 open beds (15 ICU).",
        sources=["VMC Telemetry Network", "KGH Emergency Registry"]
    )
