import math


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(2 * r * math.asin(math.sqrt(a)), 2)


# Illustrative demo POIs only — not sourced from live maps APIs.
# Distances are calculated with haversine when property coordinates exist.
CHENNAI_POIS = [
    {"name": "Demo General Hospital", "category": "hospitals", "lat": 13.0878, "lng": 80.2785},
    {"name": "Demo City Clinic", "category": "hospitals", "lat": 13.0701, "lng": 80.2492},
    {"name": "Demo Public School", "category": "schools", "lat": 13.0902, "lng": 80.2611},
    {"name": "Demo Arts College", "category": "schools", "lat": 13.0655, "lng": 80.2804},
    {"name": "Demo Metro Station", "category": "public_transport", "lat": 13.0820, "lng": 80.2758},
    {"name": "Demo Bus Terminus", "category": "public_transport", "lat": 13.0744, "lng": 80.2580},
    {"name": "Demo Retail Plaza", "category": "shopping", "lat": 13.0866, "lng": 80.2499},
    {"name": "Demo Arterial Road Junction", "category": "roads", "lat": 13.0810, "lng": 80.2660},
    {"name": "Demo IT Park Gate", "category": "it_corridors", "lat": 13.0512, "lng": 80.2478},
    {"name": "Demo International Airport (illustrative pin)", "category": "airports", "lat": 12.9941, "lng": 80.1709},
    {"name": "Demo Urban Park", "category": "parks", "lat": 13.0788, "lng": 80.2822},
]

BENGALURU_POIS = [
    {"name": "Demo Whitefield Clinic", "category": "hospitals", "lat": 12.9712, "lng": 77.7508},
    {"name": "Demo Neighbourhood School", "category": "schools", "lat": 12.9660, "lng": 77.7415},
    {"name": "Demo Suburban Station", "category": "public_transport", "lat": 12.9735, "lng": 77.7460},
    {"name": "Demo Tech Park Retail", "category": "shopping", "lat": 12.9788, "lng": 77.7389},
    {"name": "Demo ORR Junction", "category": "roads", "lat": 12.9690, "lng": 77.7550},
    {"name": "Demo IT Corridor Gate", "category": "it_corridors", "lat": 12.9795, "lng": 77.7490},
    {"name": "Demo Airport Pin (illustrative)", "category": "airports", "lat": 13.1989, "lng": 77.7068},
    {"name": "Demo Layout Park", "category": "parks", "lat": 12.9622, "lng": 77.7481},
]

DEMO_POI_CLUSTERS = [CHENNAI_POIS, BENGALURU_POIS]


def location_rings(lat: float | None, lng: float | None) -> dict:
    if lat is None or lng is None:
        return {
            "status": "unavailable",
            "message": "Data Not Available — property coordinates were not provided.",
            "data_label": "DATA NOT AVAILABLE",
            "rings_km": [1, 3, 5],
            "categories": {},
        }

    cluster = None
    best = 1e9
    for group in DEMO_POI_CLUSTERS:
        d0 = min(haversine_km(lat, lng, p["lat"], p["lng"]) for p in group)
        if d0 < best:
            best = d0
            cluster = group

    if cluster is None or best > 50:
        return {
            "status": "unavailable",
            "message": "Data Not Available — no illustrative demo POI cluster is applicable to these coordinates. Distances will not be invented.",
            "data_label": "DATA NOT AVAILABLE",
            "rings_km": [1, 3, 5],
            "categories": {},
            "property_coordinates": {"lat": lat, "lng": lng, "status": "verified", "source_type": "User Input"},
        }

    categories: dict[str, list] = {}
    for poi in cluster:
        d = haversine_km(lat, lng, poi["lat"], poi["lng"])
        ring = "beyond_5km"
        if d <= 1:
            ring = "1km"
        elif d <= 3:
            ring = "3km"
        elif d <= 5:
            ring = "5km"
        item = {
            "name": poi["name"],
            "distance_km": d,
            "ring": ring,
            "status": "demo",
            "source_type": "Demo Dataset",
            "source_reference": "Illustrative demo coordinates; distance via haversine",
        }
        categories.setdefault(poi["category"], []).append(item)

    for items in categories.values():
        items.sort(key=lambda x: x["distance_km"])

    return {
        "status": "demo",
        "message": "Illustrative Demo Data — POI positions are synthetic. Distances are calculated from provided coordinates using haversine.",
        "data_label": "DEMO / ILLUSTRATIVE DATA",
        "property_coordinates": {"lat": lat, "lng": lng, "status": "verified", "source_type": "User Input"},
        "rings_km": [1, 3, 5],
        "categories": categories,
    }
