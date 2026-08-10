import uuid
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.models import State, District, City, Zone, Ward

class GeographyRepository:
    @staticmethod
    def list_states(db: Session, limit: int = 50, offset: int = 0) -> List[State]:
        return db.query(State).order_by(State.state_name).offset(offset).limit(limit).all()

    @staticmethod
    def get_state_by_id(db: Session, state_id: uuid.UUID) -> Optional[State]:
        return db.query(State).filter(State.id == state_id).first()

    @staticmethod
    def list_districts_by_state(db: Session, state_id: uuid.UUID, limit: int = 50, offset: int = 0) -> List[District]:
        return db.query(District).filter(District.state_id == state_id).order_by(District.district_name).offset(offset).limit(limit).all()

    @staticmethod
    def get_district_by_id(db: Session, district_id: uuid.UUID) -> Optional[District]:
        return db.query(District).options(
            joinedload(District.state)
        ).filter(District.id == district_id).first()

    @staticmethod
    def list_cities_by_district(db: Session, district_id: uuid.UUID, limit: int = 50, offset: int = 0) -> List[City]:
        return db.query(City).filter(City.district_id == district_id).order_by(City.city_name).offset(offset).limit(limit).all()

    @staticmethod
    def get_city_by_id(db: Session, city_id: uuid.UUID) -> Optional[City]:
        return db.query(City).options(
            joinedload(City.district).joinedload(District.state)
        ).filter(City.id == city_id).first()

    @staticmethod
    def list_zones_by_city(db: Session, city_id: uuid.UUID, limit: int = 50, offset: int = 0) -> List[Zone]:
        return db.query(Zone).filter(Zone.city_id == city_id).order_by(Zone.zone_name).offset(offset).limit(limit).all()

    @staticmethod
    def get_zone_by_id(db: Session, zone_id: uuid.UUID) -> Optional[Zone]:
        return db.query(Zone).options(
            joinedload(Zone.city)
        ).filter(Zone.id == zone_id).first()

    @staticmethod
    def list_wards_by_zone(db: Session, zone_id: uuid.UUID, limit: int = 50, offset: int = 0) -> List[Ward]:
        return db.query(Ward).filter(Ward.zone_id == zone_id).order_by(Ward.ward_name).offset(offset).limit(limit).all()

    @staticmethod
    def get_ward_by_id(db: Session, ward_id: uuid.UUID) -> Optional[Ward]:
        return db.query(Ward).options(
            joinedload(Ward.zone)
            .joinedload(Zone.city)
            .joinedload(City.district)
            .joinedload(District.state)
        ).filter(Ward.id == ward_id).first()
