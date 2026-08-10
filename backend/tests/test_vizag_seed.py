import uuid
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.seed import seed_db
from app.models.models import (
    State,
    District,
    City,
    Zone,
    Ward,
    DigitalTwinNode,
    Resource,
)

def get_counts(db: Session):
    return {
        "states": db.query(State).count(),
        "districts": db.query(District).count(),
        "cities": db.query(City).count(),
        "zones": db.query(Zone).count(),
        "wards": db.query(Ward).count(),
        "command_centers": db.query(DigitalTwinNode).filter(DigitalTwinNode.type == "command_center").count(),
        "resources": db.query(Resource).count(),
    }

def test_vizag_seed_idempotent():
    db = SessionLocal()
    try:
        # Seed once
        seed_db(db)
        counts_before = get_counts(db)
        # Seed again to test idempotency
        seed_db(db)
        counts_after = get_counts(db)
        assert counts_before == counts_after, "Seed should be idempotent"
        # Verify hierarchy
        state = db.query(State).filter_by(state_name="Andhra Pradesh").first()
        assert state is not None
        district = db.query(District).filter_by(district_name="Visakhapatnam District").first()
        assert district is not None and district.state_id == state.id
        city = db.query(City).filter_by(city_name="Visakhapatnam").first()
        assert city is not None and city.district_id == district.id
        zone = db.query(Zone).filter_by(zone_name="Visakhapatnam Zone 1").first()
        assert zone is not None and zone.city_id == city.id
        ward = db.query(Ward).filter_by(ward_name="Ward 12").first()
        assert ward is not None and ward.zone_id == zone.id
        # Command center node
        cc_node = (
            db.query(DigitalTwinNode)
            .filter(DigitalTwinNode.type == "command_center", DigitalTwinNode.name.contains("[SIMULATED]"))
            .first()
        )
        assert cc_node is not None
        assert cc_node.state_id == state.id and cc_node.city_id == city.id
        # Resource sanity check
        resource = db.query(Resource).filter(Resource.name.contains("[SIMULATED]")).first()
        assert resource is not None
        assert resource.city_id == city.id
    finally:
        db.close()
