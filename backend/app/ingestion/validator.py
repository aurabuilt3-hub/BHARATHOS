from typing import Tuple
from app.ingestion.models import NormalizedFacility

# Bounding box coordinates for Visakhapatnam District/City region:
# Selected range: Latitude 17.4 to 18.2, Longitude 82.8 to 83.6.
# This range allows capturing the greater Visakhapatnam region (including municipal corporation boundaries and immediate suburbs/district borders)
# without being overly restrictive, while rejecting invalid locations (e.g. 0,0 or outside the state).
VIZAG_LAT_RANGE = (17.4, 18.2)
VIZAG_LON_RANGE = (82.8, 83.6)

class FacilityValidator:
    @staticmethod
    def validate(facility: NormalizedFacility) -> Tuple[bool, str]:
        # Required name check
        if not facility.name.strip():
            return False, "Validation failed: Facility name cannot be empty."

        # Supported facility types
        supported_types = {
            "POLICE_STATION",
            "FIRE_STATION",
            "HOSPITAL",
            "AMBULANCE_BASE",
            "EMERGENCY_FACILITY",
            "OTHER",
        }
        if facility.facility_type not in supported_types:
            return False, f"Validation failed: Unrecognized facility type '{facility.facility_type}'."

        # Check for absolute coordinates presence
        if facility.latitude == 0.0 or facility.longitude == 0.0:
            return False, "Validation failed: Missing or zero coordinates."

        # Visakhapatnam geographic boundary plausibility check
        lat_ok = VIZAG_LAT_RANGE[0] <= facility.latitude <= VIZAG_LAT_RANGE[1]
        lon_ok = VIZAG_LON_RANGE[0] <= facility.longitude <= VIZAG_LON_RANGE[1]
        if not (lat_ok and lon_ok):
            return False, f"Geographic validation failed: Coordinates ({facility.latitude}, {facility.longitude}) are outside the allowed Visakhapatnam bounding box ({VIZAG_LAT_RANGE}, {VIZAG_LON_RANGE})."

        # Validate source metadata existence
        if not facility.source_type or not facility.source_name:
            return False, "Validation failed: Missing source type or source name."

        return True, "Valid"
