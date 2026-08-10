from typing import Dict, Any, List

class MCPToolRegistry:
    @staticmethod
    def get_weather(city: str = "Visakhapatnam") -> Dict[str, Any]:
        return {
            "city": city,
            "condition": "Heavy Monsoonal Rain",
            "temperature_celsius": 28,
            "rainfall_24h_mm": 78,
            "wind_speed_kmh": 32,
            "warning": "Yellow Flood Alert"
        }

    @staticmethod
    def get_hospitals(city: str = "Visakhapatnam") -> List[Dict[str, Any]]:
        return [
          {"name": "King George Hospital (KGH)", "available_beds": 142, "icu_beds": 8, "phone": "0891-2564891"},
          {"name": "VIMS Super Specialty Hospital", "available_beds": 94, "icu_beds": 15, "phone": "0891-2856000"}
        ]

    @staticmethod
    def get_police(city: str = "Visakhapatnam") -> List[Dict[str, Any]]:
        return [
          {"station": "MVP Colony Police Station", "active_patrol_units": 8, "incharge": "Ins. V. Ramana"},
          {"station": "Gajuwaka Police Station", "active_patrol_units": 10, "incharge": "Ins. M. Rao"}
        ]

    @staticmethod
    def get_fire(city: str = "Visakhapatnam") -> List[Dict[str, Any]]:
        return [
          {"station": "Surya Bagh Main Fire Station", "tenders": 6, "water_capacity_liters": 45000},
          {"station": "Auto Nagar Industrial Fire Station", "tenders": 4, "water_capacity_liters": 30000}
        ]

    @staticmethod
    def get_incidents(status: str = "active") -> List[Dict[str, Any]]:
        return [
          {"id": "inc-01", "category": "Flood", "location": "Beach Road MVP Colony", "severity": "critical"},
          {"id": "inc-02", "category": "Fire", "location": "Siripuram Commercial Complex", "severity": "high"}
        ]

    @staticmethod
    def search_knowledge_base(query: str) -> List[Dict[str, Any]]:
        return [
          {
            "doc_title": "Visakhapatnam Disaster SOP Manual Section 4.2",
            "content": "During coastal inundation exceeding 4.0 meters in Ward 12, immediately close Beach Road corridor, establish emergency detour via Inner Ring Road, and dispatch high-capacity pumps M-12.",
            "relevance_score": 0.94
          }
        ]

    @staticmethod
    def calculate_route(origin: str, destination: str) -> Dict[str, Any]:
        return {
            "origin": origin,
            "destination": destination,
            "distance_km": 6.4,
            "estimated_time_minutes": 11,
            "recommended_bypass": "Inner Ring Road via MVP Colony Sector 2"
        }

    @staticmethod
    def get_sensor_data(sensor_id: str = "sns-1") -> Dict[str, Any]:
        return {
            "sensor_id": sensor_id,
            "name": "Ward 12 Storm Drain Gauge",
            "reading": 4.2,
            "unit": "meters",
            "status": "critical_threshold_exceeded"
        }
