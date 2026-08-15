# BHARATOS Data Sources Registry

SOURCE_REGISTRY = {
    "ap_govt_directory": {
        "name": "Visakhapatnam District Administration Health Directory",
        "source_type": "OFFICIAL_PUBLIC",
        "url": "https://visakhapatnam.ap.gov.in/hospitals/",
        "facility_types": ["HOSPITAL"],
        "access_method": "Manual/JSON snapshot mapping",
        "limitations": "Only lists major government/district hospitals. Periodic manual updates."
    },
    "openstreetmap_overpass": {
        "name": "OpenStreetMap / Overpass API",
        "source_type": "OPEN_DATA",
        "url": "https://www.openstreetmap.org",
        "facility_types": ["POLICE_STATION", "FIRE_STATION", "HOSPITAL"],
        "access_method": "Overpass QL bounding box query",
        "limitations": "Crowdsourced data, requires coordinate verification and name normalization."
    },
    "open_meteo_weather": {
        "name": "Open-Meteo Weather Forecast API",
        "source_type": "OPEN_DATA",
        "url": "https://api.open-meteo.com/v1/forecast",
        "access_method": "JSON REST API (Keyless)",
        "limitations": "Hourly/15-minute weather parameter forecasts."
    },
    "open_meteo_aqi": {
        "name": "Open-Meteo Air Quality API",
        "source_type": "OPEN_DATA",
        "url": "https://air-quality-api.open-meteo.com/v1/air-quality",
        "access_method": "JSON REST API (Keyless)",
        "limitations": "Hourly air quality metrics."
    },
    "apsdma_alerts": {
        "name": "Andhra Pradesh State Disaster Management Authority Alerts",
        "source_type": "OFFICIAL_PUBLIC",
        "url": "https://apsdma.ap.gov.in",
        "status": "UNAVAILABLE",
        "reason": "No verified machine-readable public API identified",
        "limitations": "No direct machine-readable feed available without scraping."
    }
}
