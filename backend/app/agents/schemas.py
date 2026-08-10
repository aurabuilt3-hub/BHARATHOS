from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Any, Dict

class AgentResponse(BaseModel):
    answer: str
    intent: str
    confidence: float
    sources: List[str] = []
    data: Optional[Any] = None
    recommendations: List[str] = []
    warnings: List[str] = []

    model_config = ConfigDict(from_attributes=True)
