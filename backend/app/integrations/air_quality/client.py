import json
import urllib.request
import urllib.error
from datetime import datetime, UTC
from typing import Dict, Any, Optional
from app.integrations.schemas import NormalizedAirQuality

class AirQualityClient:
    def __init__(self, base_url: str = "https://air-quality-api.open-meteo.com/v1/air-quality", timeout: float = 5.0):
        self.base_url = base_url
        self.timeout = timeout

    def get_air_quality(self, lat: float = 17.6868, lon: float = 83.2185) -> NormalizedAirQuality:
        url = f"{self.base_url}?latitude={lat}&longitude={lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "BharatOS/1.0"})
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                if response.status != 200:
                    raise Exception(f"HTTP error {response.status}")
                raw_data = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as he:
            raise Exception(f"AQI API HTTP error: {he.code} {he.reason}")
        except urllib.error.URLError as ue:
            raise Exception(f"AQI API connection failed: {ue.reason}")
        except json.JSONDecodeError:
            raise Exception("AQI API returned malformed response")
        except Exception as e:
            raise Exception(f"AQI API retrieval failed: {str(e)}")

        current = raw_data.get("current", {})
        observed_time_str = current.get("time")
        if observed_time_str:
            try:
                observed_at = datetime.fromisoformat(observed_time_str).replace(tzinfo=UTC)
            except ValueError:
                observed_at = datetime.now(UTC)
        else:
            observed_at = datetime.now(UTC)

        # Handle fields potentially returning None or missing
        us_aqi_val = current.get("us_aqi")
        pm2_5_val = current.get("pm2_5")
        pm10_val = current.get("pm10")
        no2_val = current.get("nitrogen_dioxide")
        o3_val = current.get("ozone")

        return NormalizedAirQuality(
            us_aqi=float(us_aqi_val) if us_aqi_val is not None else 0.0,
            pm2_5=float(pm2_5_val) if pm2_5_val is not None else 0.0,
            pm10=float(pm10_val) if pm10_val is not None else 0.0,
            nitrogen_dioxide=float(no2_val) if no2_val is not None else None,
            ozone=float(o3_val) if o3_val is not None else None,
            source_type="OPEN_DATA",
            source_name="Open-Meteo",
            source_url=url,
            source_record_id=f"aqi-{lat}-{lon}",
            observed_at=observed_at,
            raw_metadata=raw_data
        )
