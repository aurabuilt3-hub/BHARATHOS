from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import City
from app.schemas.schemas import CityResponse

router = APIRouter(prefix="/cities", tags=["Municipal Locations"])

@router.get("", response_model=List[CityResponse])
def list_cities(db: Session = Depends(get_db)):
    cities = db.query(City).all()
    return cities
