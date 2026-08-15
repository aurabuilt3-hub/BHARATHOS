import json
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, UTC
from typing import List, Dict, Any, Optional
from app.integrations.schemas import NormalizedFacility

class FacilitiesClient:
    def __init__(self, base_url: str = "https://overpass-api.de/api/interpreter", timeout: float = 15.0):
        self.base_url = base_url
        self.timeout = timeout

    def get_facilities(
        self,
        min_lat: float = 17.60,
        min_lon: float = 83.15,
        max_lat: float = 17.85,
        max_lon: float = 83.35
    ) -> List[NormalizedFacility]:
        # Formulate Overpass QL query
        query = (
            f"[out:json][timeout:25];"
            f"("
            f'  nwr["amenity"="hospital"]({min_lat},{min_lon},{max_lat},{max_lon});'
            f'  nwr["amenity"="police"]({min_lat},{min_lon},{max_lat},{max_lon});'
            f'  nwr["amenity"="fire_station"]({min_lat},{min_lon},{max_lat},{max_lon});'
            f");"
            f"out center;"
        )
        
        data = urllib.parse.urlencode({"data": query}).encode("utf-8")
        try:
            req = urllib.request.Request(self.base_url, data=data, headers={"User-Agent": "BharatOS/1.0"})
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                if response.status != 200:
                    raise Exception(f"HTTP error {response.status}")
                raw_data = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as he:
            raise Exception(f"Overpass API HTTP error: {he.code} {he.reason}")
        except urllib.error.URLError as ue:
            raise Exception(f"Overpass API connection failed: {ue.reason}")
        except json.JSONDecodeError:
            raise Exception("Overpass API returned malformed response")
        except Exception as e:
            raise Exception(f"Overpass API retrieval failed: {str(e)}")

        normalized_list = []
        elements = raw_data.get("elements", [])
        
        for el in elements:
            el_id = str(el.get("id"))
            el_type = el.get("type")
            
            # Extract coordinates point
            if el_type == "node":
                lat = el.get("lat")
                lon = el.get("lon")
            else:
                center = el.get("center", {})
                lat = center.get("lat")
                lon = center.get("lon")

            if lat is None or lon is None:
                continue

            tags = el.get("tags", {})
            raw_name = tags.get("name") or tags.get("official_name") or f"OSM Facility {el_id}"
            
            amenity = tags.get("amenity")
            if amenity == "police":
                facility_type = "POLICE_STATION"
            elif amenity == "fire_station":
                facility_type = "FIRE_STATION"
            elif amenity == "hospital":
                facility_type = "HOSPITAL"
            else:
                continue  # skip any untargeted types

            # Formulate street address if sub-attributes are available
            street = tags.get("addr:street")
            housenumber = tags.get("addr:housenumber")
            city_tag = tags.get("addr:city")
            if street:
                addr = f"{housenumber + ' ' if housenumber else ''}{street}{', ' + city_tag if city_tag else ''}"
            else:
                addr = tags.get("addr:full") or None

            phone = tags.get("phone") or tags.get("contact:phone") or None

            normalized_list.append(
                NormalizedFacility(
                    name=raw_name,
                    facility_type=facility_type,
                    address=addr,
                    phone=phone,
                    latitude=float(lat),
                    longitude=float(lon),
                    source_type="OPEN_DATA",
                    source_name="OpenStreetMap / Overpass API",
                    source_url=f"https://www.openstreetmap.org/node/{el_id}" if el_type == "node" else f"https://www.openstreetmap.org/{el_type}/{el_id}",
                    source_record_id=el_id,
                    observed_at=datetime.now(UTC),
                    original_name=raw_name,
                    original_category=amenity,
                    raw_metadata=el
                )
            )

        return normalized_list
