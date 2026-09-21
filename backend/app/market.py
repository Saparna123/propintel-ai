"""Illustrative demo market dataset. Never presented as live quotes."""

DEMO_MARKET_NOTE = "Market values shown are illustrative demo data."

# Synthetic comparables around a Chennai demo cluster — labelled Demo Dataset.
CHENNAI_COMPARABLES = [
    {"name": "Demo Comparable A", "city": "Chennai", "psf": 7800, "price": 1.15e7, "area": 1474, "yield_pct": 3.1},
    {"name": "Demo Comparable B", "city": "Chennai", "psf": 8400, "price": 1.42e7, "area": 1690, "yield_pct": 2.8},
    {"name": "Demo Comparable C", "city": "Chennai", "psf": 9100, "price": 1.68e7, "area": 1846, "yield_pct": 2.6},
    {"name": "Demo Comparable D", "city": "Chennai", "psf": 7200, "price": 9.8e6, "area": 1361, "yield_pct": 3.4},
]

BENGALURU_COMPARABLES = [
    {"name": "Demo Comparable E", "city": "Bengaluru", "psf": 9800, "price": 1.76e7, "area": 1796, "yield_pct": 2.5},
    {"name": "Demo Comparable F", "city": "Bengaluru", "psf": 10500, "price": 2.05e7, "area": 1952, "yield_pct": 2.4},
    {"name": "Demo Comparable G", "city": "Bengaluru", "psf": 8900, "price": 1.38e7, "area": 1550, "yield_pct": 2.9},
]

# Year labels are illustrative series, not historical facts.
TREND_SERIES = [
    {"period": "Y1", "index": 100},
    {"period": "Y2", "index": 104},
    {"period": "Y3", "index": 107},
    {"period": "Y4", "index": 111},
    {"period": "Y5", "index": 114},
]


def market_pack(city: str, estimated_price: float | None, area: float | None) -> dict:
    city_l = (city or "").lower()
    if "chennai" in city_l:
        comps = CHENNAI_COMPARABLES
    elif "bengaluru" in city_l or "bangalore" in city_l:
        comps = BENGALURU_COMPARABLES
    else:
        comps = []

    if not comps:
        return {
            "available": False,
            "message": "External data unavailable — assessment limited to available information.",
            "data_label": "DATA NOT AVAILABLE",
            "comparables": [],
            "trend": [],
            "evidence": ["No demo comparable set is defined for this city, and no live market feed is connected."],
        }

    psfs = [c["psf"] for c in comps]
    yields = [c["yield_pct"] for c in comps]
    user_psf = round(estimated_price / area, 2) if estimated_price and area else None
    user_yield = None  # never invent rental yield

    return {
        "available": True,
        "message": DEMO_MARKET_NOTE,
        "data_label": "DEMO / ILLUSTRATIVE DATA",
        "source": "Demo Dataset — synthetic comparables (not live listings or registrations)",
        "comparables": comps,
        "trend": TREND_SERIES,
        "demo_psf_low": min(psfs),
        "demo_psf_high": max(psfs),
        "demo_yield_avg": round(sum(yields) / len(yields), 2),
        "user_psf": user_psf,
        "user_psf_status": "verified" if user_psf is not None else "unavailable",
        "rental_yield": user_yield,
        "rental_yield_status": "unavailable",
        "rental_yield_note": "Data Not Available — rental income was not provided and will not be inferred.",
        "risk_contribution": 44,
        "evidence": [
            f"{len(comps)} illustrative comparables loaded for city cluster '{city}'.",
            DEMO_MARKET_NOTE,
        ],
    }
