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
    }
}
