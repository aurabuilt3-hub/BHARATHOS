from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.models import User
from app.schemas.rural import RuralBaselineResponse, RuralSimulationRequest, RuralSimulationResponse
from app.services.rural_flood_service import RuralFloodService

router = APIRouter(prefix="/rural", tags=["Rural Flood Intelligence"])

@router.get("/baseline", response_model=RuralBaselineResponse)
def get_rural_baseline(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetches the historical rainfall baseline dataset properties and aggregates for Visakhapatnam District.
    """
    try:
        baseline = RuralFloodService.get_district_baseline(db, "Visakhapatnam")
        if not baseline:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Baseline data not found for Visakhapatnam District."
            )
        return baseline
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve rural baseline metrics: {str(e)}"
        )

@router.post("/simulate", response_model=RuralSimulationResponse)
def simulate_rural_scenario(
    request: RuralSimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulates a daily rainfall scenario in rural Visakhapatnam for a given month.
    Combines deterministic risk boundaries with Gemini AI qualitative advice.
    """
    try:
        # Run deterministic risk evaluation engine
        risk_data = RuralFloodService.calculate_scenario_risk(
            db=db,
            month=request.month,
            scenario_rainfall_mm=request.rainfall_mm,
            district="Visakhapatnam"
        )
        
        # Invoke Gemini AI for qualitative extension advisories
        ai_recommendation = RuralFloodService.get_ai_recommendation(db, risk_data)
        risk_data["ai_recommendation"] = ai_recommendation
        
        return risk_data
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scenario simulation execution failed: {str(e)}"
        )
