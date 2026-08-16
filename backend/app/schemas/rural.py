from pydantic import BaseModel, ConfigDict, Field
from typing import Dict, Any, List, Optional

class DateRange(BaseModel):
    start: Optional[str] = None
    end: Optional[str] = None

class MonthlyStat(BaseModel):
    month: int
    record_count: int
    avg_rainfall: float
    max_rainfall: float
    std_rainfall: float

class Percentiles(BaseModel):
    p50: float
    p75: float
    p90: float
    p95: float
    p99: float

class RuralBaselineResponse(BaseModel):
    district: str
    total_records: int
    date_range: DateRange
    percentiles: Percentiles
    monthly_stats: List[MonthlyStat]
    agency_name: str
    source_type: str

    model_config = ConfigDict(from_attributes=True)

class RuralSimulationRequest(BaseModel):
    month: int = Field(..., ge=1, le=12, description="Month (1 to 12)")
    rainfall_mm: float = Field(..., ge=0.0, description="Scenario daily rainfall in mm/day")

class ScenarioInfo(BaseModel):
    month: int
    rainfall_mm: float

class BaselineInfo(BaseModel):
    monthly_avg_mm: float
    monthly_max_mm: float
    monthly_std_mm: float
    percentiles: Percentiles

class SimulationMetrics(BaseModel):
    z_score: float
    pct_deviation: float
    is_anomaly: bool

class RuralSimulationResponse(BaseModel):
    location: str
    risk_level: str
    scenario: ScenarioInfo
    historical_baseline: BaselineInfo
    metrics: SimulationMetrics
    risk_drivers: List[str]
    evidence: List[str]
    agricultural_impact: List[str]
    ai_recommendation: str
    agency_name: str
    source_type: str

    model_config = ConfigDict(from_attributes=True)
