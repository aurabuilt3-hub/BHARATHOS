import math
import re
from typing import List, Tuple, Optional
from app.ingestion.models import NormalizedFacility

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in meters between two points using the Haversine formula."""
    R = 6371000.0  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class FacilityDeduplicator:
    @staticmethod
    def _simplify_name(name: str) -> str:
        # Convert to lowercase, remove non-alphanumeric and common stop words/suffixes
        name = name.lower()
        name = re.sub(r'[^a-z0-9\s]', '', name)
        # Remove common designators
        designators = [
            r'\bpolice station\b', r'\bps\b',
            r'\bfire station\b', r'\bfire\b',
            r'\bhospital\b', r'\bclinic\b', r'\bnursing home\b', r'\bmedical centre\b', r'\bmedical center\b',
            r'\bcentral\b', r'\bgovernment\b', r'\bgovt\b'
        ]
        for pattern in designators:
            name = re.sub(pattern, '', name)
        return " ".join(name.split())

    @classmethod
    def are_duplicate_candidates(
        cls, fac1: NormalizedFacility, fac2: NormalizedFacility
    ) -> Tuple[bool, bool]:
        """Check if two facilities are duplicate candidates.
        Returns:
            (is_duplicate, needs_review)
        """
        # 1. Exact source record ID match (if same source)
        id1 = fac1.extra_data.get("source_record_id") if fac1.extra_data else None
        id2 = fac2.extra_data.get("source_record_id") if fac2.extra_data else None
        if id1 and id2 and id1 == id2 and fac1.source_name == fac2.source_name:
            return True, False

        # 2. Check coordinate distance
        dist = haversine_distance(fac1.latitude, fac1.longitude, fac2.latitude, fac2.longitude)
        
        # 3. Check facility type match
        type_match = fac1.facility_type == fac2.facility_type

        # If they are very close (e.g., < 20 meters) and same type -> duplicate
        if dist < 20.0 and type_match:
            return True, False

        # If they are within 100 meters
        if dist < 100.0:
            if type_match:
                name1 = cls._simplify_name(fac1.name)
                name2 = cls._simplify_name(fac2.name)
                # If simplified names share a significant word or match
                if name1 == name2 or not name1 or not name2:
                    return True, False
                
                # Check for intersection of words
                words1 = set(name1.split())
                words2 = set(name2.split())
                if words1.intersection(words2):
                    return True, False
                
                # If they are same type and close, but names are different -> potential duplicate needs review
                return False, True
            else:
                # Close, but different type -> probably different entities co-located (e.g. clinic inside police compound)
                return False, False

        # 4. Check matching names exactly elsewhere (far away)
        # Even if coordinates are slightly further but name and type are identical, flag for review
        if dist < 1000.0 and type_match:
            name1 = cls._simplify_name(fac1.name)
            name2 = cls._simplify_name(fac2.name)
            if name1 == name2 and len(name1) > 3:
                return False, True

        return False, False
