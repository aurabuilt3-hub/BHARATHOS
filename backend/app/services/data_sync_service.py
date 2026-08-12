import os
import json
import uuid
import time
from datetime import datetime, UTC
from sqlalchemy.orm import Session
from sqlalchemy import select, delete

from sqlalchemy.orm.attributes import flag_modified
from app.models.models import State, District, City, Facility, TelemetryRecord, DigitalTwinNode, AuditLog
from app.integrations.weather.client import WeatherClient
from app.integrations.air_quality.client import AirQualityClient
from app.integrations.facilities.client import FacilitiesClient
from app.ingestion.validator import FacilityValidator
from app.ingestion.deduplicator import FacilityDeduplicator, haversine_distance

REPORT_PATH = "C:/Users/surya/Desktop/BharatOS/backend/app/data_sources/ingestion_report.json"
WEATHER_AQI_NODE_ID = "e47ac10b-58cc-4372-a567-0e02b2c3d495"

def calculate_freshness(observed_at: datetime) -> str:
    if not observed_at:
        return "UNKNOWN"
    # Ensure tz info matches
    now = datetime.now(observed_at.tzinfo)
    diff = (now - observed_at).total_seconds()
    if diff < 0:
        return "FRESH"
    if diff <= 3600:  # 1 hour
        return "FRESH"
    elif diff <= 14400: # 4 hours
        return "STALE"
    else:
        return "EXPIRED"

class DataSyncService:
    @staticmethod
    def get_geographic_ids(db: Session):
        state = db.execute(select(State).where(State.state_name == "Andhra Pradesh")).scalar_one_or_none()
        district = db.execute(select(District).where(District.district_name == "Visakhapatnam District")).scalar_one_or_none()
        city = db.execute(select(City).where(City.city_name == "Visakhapatnam")).scalar_one_or_none()
        return {
            "state_id": state.id if state else None,
            "district_id": district.id if district else None,
            "city_id": city.id if city else None
        }

    @classmethod
    def sync_all(cls, db: Session, user_id: Optional[uuid.UUID] = None) -> dict:
        start_time = datetime.now(UTC)
        start_ms = time.time()
        geo_ids = cls.get_geographic_ids(db)

        # 1. Weather sync
        weather_status = "success"
        weather_errors = []
        weather_ok = False
        weather_data = None
        try:
            client = WeatherClient()
            weather_data = client.get_weather()
            
            # Find the monitoring station node
            node = db.get(DigitalTwinNode, uuid.UUID(WEATHER_AQI_NODE_ID))
            if node:
                current_telemetry = dict(node.last_telemetry or {})
                current_telemetry.update({
                    "temperature": weather_data.temperature,
                    "humidity": weather_data.humidity,
                    "precipitation": weather_data.precipitation,
                    "wind_speed": weather_data.wind_speed,
                    "weather_code": weather_data.weather_code,
                    "observed_at": weather_data.observed_at.isoformat(),
                    "source_name": weather_data.source_name,
                    "source_type": weather_data.source_type,
                    "source_url": weather_data.source_url,
                    "freshness": calculate_freshness(weather_data.observed_at)
                })
                node.last_telemetry = current_telemetry
                flag_modified(node, "last_telemetry")
                db.flush()
                
                # Add individual Telemetry Records
                metrics = [
                    ("temperature", weather_data.temperature, "°C"),
                    ("relative_humidity", weather_data.humidity, "%"),
                    ("precipitation", weather_data.precipitation, "mm"),
                    ("wind_speed", weather_data.wind_speed, "km/h")
                ]
                for metric_type, val, unit in metrics:
                    rec = TelemetryRecord(
                        id=uuid.uuid4(),
                        node_id=node.id,
                        metric_type=metric_type,
                        value=val,
                        unit=unit,
                        status="normal",
                        timestamp=weather_data.observed_at
                    )
                    db.add(rec)
                weather_ok = True
        except Exception as e:
            weather_status = "failed"
            weather_errors.append(str(e))

        # 2. Air Quality sync
        aqi_status = "success"
        aqi_errors = []
        aqi_ok = False
        aqi_data = None
        try:
            client = AirQualityClient()
            aqi_data = client.get_air_quality()

            node = db.get(DigitalTwinNode, uuid.UUID(WEATHER_AQI_NODE_ID))
            if node:
                current_telemetry = dict(node.last_telemetry or {})
                current_telemetry.update({
                    "aqi": aqi_data.us_aqi,
                    "pm2_5": aqi_data.pm2_5,
                    "pm10": aqi_data.pm10,
                    "nitrogen_dioxide": aqi_data.nitrogen_dioxide,
                    "ozone": aqi_data.ozone,
                    "aqi_observed_at": aqi_data.observed_at.isoformat(),
                    "aqi_source_name": aqi_data.source_name,
                    "aqi_source_type": aqi_data.source_type,
                    "aqi_source_url": aqi_data.source_url,
                    "aqi_freshness": calculate_freshness(aqi_data.observed_at)
                })
                node.last_telemetry = current_telemetry
                flag_modified(node, "last_telemetry")
                db.flush()

                # Add individual Telemetry Records
                metrics = [
                    ("aqi", aqi_data.us_aqi, "index"),
                    ("pm2_5", aqi_data.pm2_5, "µg/m³"),
                    ("pm10", aqi_data.pm10, "µg/m³")
                ]
                for metric_type, val, unit in metrics:
                    rec = TelemetryRecord(
                        id=uuid.uuid4(),
                        node_id=node.id,
                        metric_type=metric_type,
                        value=val,
                        unit=unit,
                        status="normal",
                        timestamp=aqi_data.observed_at
                    )
                    db.add(rec)
                aqi_ok = True
        except Exception as e:
            aqi_status = "failed"
            aqi_errors.append(str(e))

        # 3. Facilities Overpass sync
        facilities_status = "success"
        facilities_errors = []
        facilities_inserted = 0
        facilities_updated = 0
        facilities_duplicates = 0
        osm_facilities = []
        try:
            client = FacilitiesClient()
            osm_facilities = client.get_facilities()

            # Query existing facilities
            existing_stmt = select(Facility).where(Facility.city_id == geo_ids["city_id"])
            existing_facilities = list(db.execute(existing_stmt).scalars().all())

            for f in osm_facilities:
                # Validate coordinates bounding box
                # Format to Normalizer model for validation
                from app.ingestion.models import NormalizedFacility as IngestionNormalizedFacility
                norm_fac = IngestionNormalizedFacility(
                    name=f.name,
                    facility_type=f.facility_type,
                    address=f.address,
                    phone=f.phone,
                    latitude=f.latitude,
                    longitude=f.longitude,
                    source_type=f.source_type,
                    source_name=f.source_name,
                    source_url=f.source_url,
                    verified_at=f.observed_at,
                    extra_data=f.raw_metadata
                )
                is_valid, reason = FacilityValidator.validate(norm_fac)
                if not is_valid:
                    # skip invalid
                    continue

                # Deduplicate
                is_dup = False
                matched_existing = None
                for exist_fac in existing_facilities:
                    exist_norm = IngestionNormalizedFacility(
                        name=exist_fac.name,
                        facility_type=exist_fac.facility_type,
                        latitude=exist_fac.latitude,
                        longitude=exist_fac.longitude,
                        source_type=exist_fac.source_type,
                        source_name=exist_fac.source_name,
                        source_url=exist_fac.source_url or "",
                        extra_data=exist_fac.extra_data
                    )
                    is_d, needs_r = FacilityDeduplicator.are_duplicate_candidates(norm_fac, exist_norm)
                    if is_d or needs_r:
                        is_dup = True
                        matched_existing = exist_fac
                        break

                if is_dup:
                    facilities_duplicates += 1
                    # Skip or update ONLY if existing source is NOT high-confidence official
                    # Rule: DO NOT overwrite OFFICIAL_PUBLIC or VERIFIED_PUBLIC with OPEN_DATA
                    if matched_existing and matched_existing.source_type not in ("OFFICIAL_PUBLIC", "VERIFIED_PUBLIC"):
                        # safe to update address or phone
                        updated = False
                        if not matched_existing.address and f.address:
                            matched_existing.address = f.address
                            updated = True
                        if not matched_existing.phone and f.phone:
                            matched_existing.phone = f.phone
                            updated = True
                        
                        extra_dict = dict(matched_existing.extra_data or {})
                        if f.source_record_id:
                            extra_dict["source_record_id"] = f.source_record_id
                        if f.raw_metadata:
                            extra_dict.update(f.raw_metadata)
                            
                        if extra_dict != matched_existing.extra_data:
                            matched_existing.extra_data = extra_dict
                            updated = True
                        if updated:
                            facilities_updated += 1
                            db.flush()
                    continue

                # New insert
                extra_dict = {}
                if f.raw_metadata:
                    extra_dict.update(f.raw_metadata)
                if f.source_record_id:
                    extra_dict["source_record_id"] = f.source_record_id

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
                    source_type=f.source_type,
                    source_name=f.source_name,
                    source_url=f.source_url,
                    verified_at=f.observed_at,
                    extra_data=extra_dict
                )
                db.add(new_fac)
                facilities_inserted += 1
                db.flush()

        except Exception as e:
            facilities_status = "failed"
            facilities_errors.append(str(e))

        db.commit()

        # Calculate final stats
        end_time = datetime.now(UTC)
        duration_ms = int((time.time() - start_ms) * 1000)

        sync_report = {
            "status": "success",
            "started_at": start_time.isoformat(),
            "completed_at": end_time.isoformat(),
            "duration_ms": duration_ms,
            "sources": {
                "open_meteo_weather": {
                    "status": weather_status,
                    "records_processed": 1 if weather_ok else 0,
                    "records_created": 4 if weather_ok else 0,
                    "records_updated": 0,
                    "errors": weather_errors
                },
                "open_meteo_aqi": {
                    "status": aqi_status,
                    "records_processed": 1 if aqi_ok else 0,
                    "records_created": 3 if aqi_ok else 0,
                    "records_updated": 0,
                    "errors": aqi_errors
                },
                "openstreetmap_overpass": {
                    "status": facilities_status,
                    "records_processed": len(osm_facilities),
                    "records_created": facilities_inserted,
                    "records_updated": facilities_updated,
                    "duplicates": facilities_duplicates,
                    "errors": facilities_errors
                }
            }
        }

        # Write to PostgreSQL audit log
        audit = AuditLog(
            user_id=user_id,
            action="DATA_INGESTION_SYNC",
            table_name="data_ingestion",
            new_values=sync_report,
            created_at=datetime.utcnow()
        )
        db.add(audit)
        db.commit()

        # Write to ingestion_report.json for backward compatibility
        try:
            os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
            report_data = {
                "last_run": end_time.isoformat(),
                "dry_run": False,
                "stats": {
                    "source": "OpenStreetMap + Open-Meteo Ingestion Service",
                    "discovered": len(osm_facilities) + (1 if weather_ok else 0) + (1 if aqi_ok else 0),
                    "valid": len(osm_facilities) + (1 if weather_ok else 0) + (1 if aqi_ok else 0),
                    "inserted": facilities_inserted,
                    "updated": facilities_updated,
                    "duplicates": facilities_duplicates,
                    "needs_review": 0,
                    "invalid": 0,
                    "errors": weather_errors + aqi_errors + facilities_errors
                }
            }
            with open(REPORT_PATH, "w", encoding="utf-8") as f:
                json.dump(report_data, f, indent=2)
        except Exception:
            pass

        return sync_report
