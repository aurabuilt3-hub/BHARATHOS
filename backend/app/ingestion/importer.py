import sys
import json
import os
import uuid
from datetime import datetime, UTC
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.models import State, District, City, Zone, Ward, Facility, AuditLog
from app.ingestion.normalizer import FacilityNormalizer
from app.ingestion.validator import FacilityValidator
from app.ingestion.deduplicator import FacilityDeduplicator, haversine_distance

REPORT_PATH = "C:/Users/surya/Desktop/BharatOS/backend/app/data_sources/ingestion_report.json"
SNAPSHOT_PATH = "C:/Users/surya/Desktop/BharatOS/backend/app/data_sources/vizag_public_snapshot.json"

def get_geographic_ids(db: Session):
    """Resolve geographic IDs for Andhra Pradesh, Visakhapatnam District, and Visakhapatnam City."""
    state = db.execute(select(State).where(State.state_name == "Andhra Pradesh")).scalar_one_or_none()
    district = db.execute(select(District).where(District.district_name == "Visakhapatnam District")).scalar_one_or_none()
    city = db.execute(select(City).where(City.city_name == "Visakhapatnam")).scalar_one_or_none()
    
    return {
        "state_id": state.id if state else None,
        "district_id": district.id if district else None,
        "city_id": city.id if city else None
    }

def run_ingestion(db: Session, dry_run: bool = False) -> dict:
    if not os.path.exists(SNAPSHOT_PATH):
        raise FileNotFoundError(f"Snapshot file not found at {SNAPSHOT_PATH}")
        
    with open(SNAPSHOT_PATH, "r", encoding="utf-8") as f:
        raw_records = json.load(f)

    geo_ids = get_geographic_ids(db)
    if not geo_ids["state_id"] or not geo_ids["city_id"]:
         raise ValueError("Andhra Pradesh or Visakhapatnam City geographic records are missing from DB. Run seed first.")

    # Load existing facilities from DB for deduplication
    existing_stmt = select(Facility).where(Facility.city_id == geo_ids["city_id"])
    existing_facilities = list(db.execute(existing_stmt).scalars().all())

    stats = {
        "source": "OpenStreetMap + AP Govt Directory Snapshot",
        "discovered": len(raw_records),
        "valid": 0,
        "inserted": 0,
        "updated": 0,
        "duplicates": 0,
        "needs_review": 0,
        "invalid": 0,
        "errors": []
    }

    # Temporary list to keep track of newly normalized facilities in this batch
    batch_facilities = []
    
    # Track items flagged for review
    review_list = []

    for raw in raw_records:
        try:
            # 1. Normalize
            fac_norm = FacilityNormalizer.to_normalized_facility(raw)
            
            # 2. Validate
            is_valid, reason = FacilityValidator.validate(fac_norm)
            if not is_valid:
                stats["invalid"] += 1
                stats["errors"].append(f"Validation failed for '{raw.get('name')}': {reason}")
                continue
                
            stats["valid"] += 1
            
            # 3. Deduplicate
            is_dup = False
            needs_rev = False
            matched_existing = None
            
            # Check against existing DB facilities
            for exist_fac in existing_facilities:
                # Convert DB facility to Normalized for compatibility
                exist_norm = FacilityNormalizer.to_normalized_facility({
                    "name": exist_fac.name,
                    "facility_type": exist_fac.facility_type,
                    "latitude": exist_fac.latitude,
                    "longitude": exist_fac.longitude,
                    "source_type": exist_fac.source_type,
                    "source_name": exist_fac.source_name,
                    "extra_data": exist_fac.extra_data
                })
                is_d, needs_r = FacilityDeduplicator.are_duplicate_candidates(fac_norm, exist_norm)
                if is_d:
                    is_dup = True
                    matched_existing = exist_fac
                    break
                if needs_r:
                    needs_rev = True
                    matched_existing = exist_fac
            
            # Check against batch facilities to avoid internal duplication
            if not is_dup:
                for batch_fac in batch_facilities:
                    is_d, needs_r = FacilityDeduplicator.are_duplicate_candidates(fac_norm, batch_fac)
                    if is_d:
                        is_dup = True
                        break
                    if needs_r:
                        needs_rev = True

            if is_dup:
                stats["duplicates"] += 1
                if matched_existing:
                    # Update idempotent fields if changed/better
                    # e.g., if existing address is null but new is not
                    updated = False
                    if not matched_existing.address and fac_norm.address:
                        matched_existing.address = fac_norm.address
                        updated = True
                    if not matched_existing.phone and fac_norm.phone:
                        matched_existing.phone = fac_norm.phone
                        updated = True
                    
                    # Merge extra_data
                    if fac_norm.extra_data:
                        existing_extra = matched_existing.extra_data or {}
                        merged_extra = {**existing_extra, **fac_norm.extra_data}
                        if merged_extra != existing_extra:
                            matched_existing.extra_data = merged_extra
                            updated = True
                            
                    if updated:
                        stats["updated"] += 1
                        if not dry_run:
                            db.flush()
                continue

            if needs_rev:
                stats["needs_review"] += 1
                review_list.append({
                    "name": fac_norm.name,
                    "facility_type": fac_norm.facility_type,
                    "latitude": fac_norm.latitude,
                    "longitude": fac_norm.longitude,
                    "reason": "Suspected duplicate within 100m or similar name, skipped from auto-import."
                })
                continue

            # Add to batch for import
            batch_facilities.append(fac_norm)

        except Exception as e:
            stats["invalid"] += 1
            stats["errors"].append(f"Unexpected error processing: {str(e)}")

    # 4. Perform imports
    if not dry_run:
        for f in batch_facilities:
            new_fac = Facility(
                id=uuid.uuid4(),
                name=f.name,
                facility_type=f.facility_type,
                address=f.address,
                phone=f.phone,
                latitude=f.latitude,
                longitude=f.longitude,
                state_id=geo_ids["state_id"],
                district_id=geo_ids["district_id"],
                city_id=geo_ids["city_id"],
                zone_id=None,
                ward_id=None,
                source_type=f.source_type,
                source_name=f.source_name,
                source_url=f.source_url,
                verified_at=f.verified_at,
                extra_data=f.extra_data
            )
            db.add(new_fac)
            stats["inserted"] += 1
        db.commit()
    else:
        stats["inserted"] = len(batch_facilities)

    # Save local status report
    report_data = {
        "last_run": datetime.now(UTC).isoformat(),
        "dry_run": dry_run,
        "stats": stats,
        "review_list": review_list
    }
    
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as rf:
        json.dump(report_data, rf, indent=2)

    return report_data

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    print(f"Starting Ingestion pipeline (Dry run: {dry_run})...")
    db = SessionLocal()
    try:
        report = run_ingestion(db, dry_run=dry_run)
        print("========================================")
        print("BHARATOS VIZAG DATA INGESTION")
        print("========================================")
        print(f"Source:        {report['stats']['source']}")
        print(f"Discovered:    {report['stats']['discovered']}")
        print(f"Valid:         {report['stats']['valid']}")
        print(f"Inserted:      {report['stats']['inserted']}")
        print(f"Updated:       {report['stats']['updated']}")
        print(f"Duplicates:    {report['stats']['duplicates']}")
        print(f"Needs Review:  {report['stats']['needs_review']}")
        print(f"Invalid:       {report['stats']['invalid']}")
        print("========================================")
        if dry_run:
            print("DRY RUN COMPLETED. No database changes were made.")
        else:
            print("INGESTION COMPLETED SUCCESSFULLY.")
    except Exception as e:
        print(f"Critical Ingestion Failure: {e}")
        sys.exit(1)
    finally:
        db.close()
