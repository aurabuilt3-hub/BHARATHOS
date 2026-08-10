from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.models import Resource, Department, City

DEFAULT_LIMIT = 20
MAX_LIMIT = 100

class ResourceRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_resources(
        self,
        *,
        page: int = 1,
        limit: int = DEFAULT_LIMIT,
        state_id: Optional[str] = None,
        district_id: Optional[str] = None,
        city_id: Optional[str] = None,
        department_id: Optional[str] = None,
        type_: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Resource]:
        if limit > MAX_LIMIT:
            limit = MAX_LIMIT
        offset = (page - 1) * limit
        stmt = select(Resource)
        # Apply filters
        if state_id:
            stmt = stmt.join(City, Resource.city_id == City.id)
            stmt = stmt.where(City.state_id == state_id)
        if district_id:
            stmt = stmt.join(City, Resource.city_id == City.id)
            stmt = stmt.where(City.district_id == district_id)
        if city_id:
            stmt = stmt.where(Resource.city_id == city_id)
        if department_id:
            stmt = stmt.where(Resource.department_id == department_id)
        if type_:
            stmt = stmt.where(Resource.type == type_)
        if status:
            stmt = stmt.where(Resource.status == status)
        stmt = stmt.offset(offset).limit(limit)
        return self.db.execute(stmt).scalars().all()

    def get_resource(self, resource_id: str) -> Optional[Resource]:
        return self.db.get(Resource, resource_id)

    def create_resource(self, *, name: str, type_: str, latitude: float, longitude: float,
                        department_id: Optional[str] = None, city_id: Optional[str] = None) -> Resource:
        resource = Resource(
            name=name,
            type=type_,
            latitude=latitude,
            longitude=longitude,
            department_id=department_id,
            city_id=city_id,
        )
        self.db.add(resource)
        self.db.commit()
        self.db.refresh(resource)
        return resource

    def update_resource(self, resource: Resource, **kwargs) -> Resource:
        for key, value in kwargs.items():
            setattr(resource, key, value)
        self.db.commit()
        self.db.refresh(resource)
        return resource

    def update_status(self, resource: Resource, new_status: str) -> Resource:
        resource.status = new_status
        self.db.commit()
        self.db.refresh(resource)
        return resource

    def count_by_status(self) -> dict:
        stmt = select(Resource.status, func.count()).group_by(Resource.status)
        result = self.db.execute(stmt).all()
        return {status: count for status, count in result}

    def get_available_resources(self, **filters) -> List[Resource]:
        return self.list_resources(status="available", **filters)
