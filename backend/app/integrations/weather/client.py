import json
import urllib.request
import urllib.error
from datetime import datetime, UTC
from typing import Dict, Any, Optional
from app.integrations.schemas import NormalizedWeather

class WeatherClient:
    def __init__(self, base_url: str = "https://api.open-meteo.com/v1/forecast", timeout: float = 5.0):
        self.base_url = base_url
        self.timeout = timeout

    def get_weather(self, lat: float = 17.6868, lon: float = 83.2185) -> NormalizedWeather:
        url = f"{self.base_url}?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "BharatOS/1.0"})
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                if response.status != 200:
                    raise Exception(f"HTTP error {response.status}")
                raw_data = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as he:
            raise Exception(f"Weather API HTTP error: {he.code} {he.reason}")
        except urllib.error.URLError as ue:
            raise Exception(f"Weather API connection failed: {ue.reason}")
        except json.JSONDecodeError:
            raise Exception("Weather API returned malformed response")
        except Exception as e:
            raise Exception(f"Weather API retrieval failed: {str(e)}")

        current = raw_data.get("current", {})
        observed_time_str = current.get("time")
        if observed_time_str:
            try:
                # Open-Meteo time format is 'YYYY-MM-DDTHH:MM' or similar, naive
                observed_at = datetime.fromisoformat(observed_time_str).replace(tzinfo=UTC)
            except ValueError:
                observed_at = datetime.now(UTC)
        else:
            observed_at = datetime.now(UTC)

        return NormalizedWeather(
            temperature=float(current.get("temperature_2m", 0.0)),
            humidity=float(current.get("relative_humidity_2m", 0.0)),
            precipitation=float(current.get("precipitation", 0.0)),
            wind_speed=float(current.get("wind_speed_10m", 0.0)),
            weather_code=current.get("weather_code"),
            source_type="OPEN_DATA",
            source_name="Open-Meteo",
            source_url=url,
            source_record_id=f"weather-{lat}-{lon}",
            observed_at=observed_at,
            raw_metadata=raw_data
        )
