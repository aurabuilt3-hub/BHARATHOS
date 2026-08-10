from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Department
from app.schemas.schemas import DepartmentResponse

router = APIRouter(prefix="/departments", tags=["Departments & Operations"])

@router.get("", response_model=List[DepartmentResponse])
def list_departments(db: Session = Depends(get_db)):
    depts = db.query(Department).all()
    return depts
