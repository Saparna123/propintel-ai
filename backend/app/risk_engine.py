from copy import deepcopy

from .config import DEFAULT_RISK_WEIGHTS

DIMENSIONS = [
    "legal",
    "financial",
    "market",
    "location",
    "infrastructure",
    "documentation",
]


def classify(score: float) -> str:
    if score <= 25:
        return "Low"
    if score <= 50:
        return "Moderate"
    if score <= 75:
        return "High"
    return "Critical"


def _confidence(evidence_count: int, status: str) -> str:
    if status == "unavailable":
        return "limited"
    if evidence_count >= 3:
        return "high"
    if evidence_count == 2:
        return "medium"
    return "limited"


def evaluate_dimensions(research: dict, weights: dict) -> dict:
    docs = research.get("documents") or []
    user = research["input"]
    loc = research.get("location") or {}
    market = research.get("market") or {}

    readable_docs = [d for d in docs if d.get("processing_status") == "completed"]
    doc_types = {d.get("document_type") for d in readable_docs}
    expected = {
        "Sale Deed",
        "RERA Document",
        "Encumbrance Document",
        "Tax/Registration Document",
    }
    present = expected.intersection(doc_types)
    missing = expected - present

    # Documentation — scored from uploads only; never treated as official verification.
    if not docs:
        documentation = {
            "key": "documentation",
            "label": "Documentation Risk",
            "available": True,
            "score": 78,
            "band": "Critical",
            "status": "ai_inferred",
            "confidence": "medium",
            "risk_detected": "Required documentation information is unavailable.",
            "evidence": [
                "No documents were uploaded for this research request.",
                "The platform does not retrieve official registries automatically in the current data mode.",
            ],
            "explanation": "Without sale, encumbrance, tax/registration, or applicable approval documents, documentation completeness cannot be established.",
            "verification": "Review original property, registration, encumbrance, and applicable approval records through appropriate official sources.",
            "evidence_count": 1,
            "source_type": "User Input",
        }
    else:
        coverage = len(present) / len(expected)
        score = round(max(18, min(88, 88 - coverage * 70 + (8 if any(d.get("extraction_errors") for d in docs) else 0))))
        documentation = {
            "key": "documentation",
            "label": "Documentation Risk",
            "available": True,
            "score": score,
            "band": classify(score),
            "status": "ai_inferred",
            "confidence": _confidence(len(readable_docs), "ok"),
            "risk_detected": "Uploaded files were catalogued; official authenticity has not been established.",
            "evidence": [
                f"{len(docs)} file(s) uploaded; {len(readable_docs)} processed.",
                f"Document types present: {', '.join(sorted(present)) or 'none of the core types'}.",
                f"Core types not provided: {', '.join(sorted(missing)) or 'none'}." if missing else "All listed demonstration document types were provided.",
            ],
            "explanation": "Uploading a file does not constitute official verification. Extraction, where performed, is limited to readable text and user-declared type.",
            "verification": "Independently authenticate each document with the issuing authority or registrar. Do not treat platform extraction as legal clearance.",
            "evidence_count": len(docs),
            "source_type": "Uploaded Document",
        }

    # Legal — no government/court/RERA APIs; do not invent legal safety.
    legal = {
        "key": "legal",
        "label": "Legal Risk",
        "available": False,
        "score": None,
        "band": None,
        "status": "unavailable",
        "confidence": "limited",
        "risk_detected": "Legal standing cannot be determined from available data.",
        "evidence": [
            "No connected government, RERA, CMDA, registration, or court record source is available in the current data mode.",
            "The system will not infer ownership, litigation, or legal clearance.",
        ],
        "explanation": "Legal conclusions require authoritative records. Absence of issues in this application is not evidence that no issues exist.",
        "verification": "Verify ownership, encumbrance, planning/zoning, and applicable litigation status through official channels.",
        "evidence_count": 0,
        "source_type": "Not Available",
        "source_reference": None,
    }

    # Financial — user price vs demo market band only when demo market exists.
    price = user.get("estimated_price")
    area = user.get("built_up_area")
    demo_psf_low = market.get("demo_psf_low")
    demo_psf_high = market.get("demo_psf_high")
    psf = None
    if price and area and area > 0:
        psf = round(price / area, 2)

    if price is None:
        financial = {
            "key": "financial",
            "label": "Financial Risk",
            "available": False,
            "score": None,
            "band": None,
            "status": "unavailable",
            "confidence": "limited",
            "risk_detected": "Estimated price was not provided.",
            "evidence": ["Required information is unavailable to complete this assessment."],
            "explanation": "Financial indicators such as price per sq.ft cannot be computed without price and area.",
            "verification": "Independently validate market valuation through licensed professionals and published transaction records where applicable.",
            "evidence_count": 0,
            "source_type": "Not Available",
        }
    else:
        score = 42
        evidence = [f"User-provided estimated price: {price} (Verified — User Input)."]
        if psf is not None:
            evidence.append(f"Price per sq.ft derived from user inputs: {psf}.")
        if demo_psf_low is not None and demo_psf_high is not None and psf is not None:
            if psf < demo_psf_low * 0.75 or psf > demo_psf_high * 1.25:
                score = 61
                evidence.append(
                    "User-derived price per sq.ft sits outside the illustrative demo comparable band. This is not a live market quote."
                )
            else:
                score = 38
                evidence.append(
                    "User-derived price per sq.ft is within the illustrative demo comparable band. Band is Demo / Illustrative Data."
                )
        else:
            evidence.append("No reliable comparable band is available beyond demo illustrations.")
            score = 48
        financial = {
            "key": "financial",
            "label": "Financial Risk",
            "available": True,
            "score": score,
            "band": classify(score),
            "status": "ai_inferred",
            "confidence": "limited",
            "risk_detected": "Financial exposure is assessed only from user-provided figures and labelled demo comparables.",
            "evidence": evidence,
            "explanation": "This is not a valuation. Deviation from demo bands may reflect incomplete data rather than mispricing.",
            "verification": "Independently validate market valuation and financing assumptions.",
            "evidence_count": len(evidence),
            "source_type": "User Input + Demo Dataset",
        }

    # Market
    if market.get("available"):
        m_score = market.get("risk_contribution", 44)
        market_dim = {
            "key": "market",
            "label": "Market Risk",
            "available": True,
            "score": m_score,
            "band": classify(m_score),
            "status": "demo",
            "confidence": "limited",
            "risk_detected": "Market indicators are drawn from an illustrative demo dataset, not live transactions.",
            "evidence": market.get("evidence") or ["Demo comparable set attached to this research."],
            "explanation": "Trend and yield figures are demonstration values and must not be treated as current market facts.",
            "verification": "Validate prices, rents, and trends using independent market sources.",
            "evidence_count": len(market.get("comparables") or []),
            "source_type": "Demo Dataset",
        }
    else:
        market_dim = {
            "key": "market",
            "label": "Market Risk",
            "available": False,
            "score": None,
            "band": None,
            "status": "unavailable",
            "confidence": "limited",
            "risk_detected": "Market values cannot be established.",
            "evidence": ["External market data is currently unavailable. The system will not infer missing information."],
            "explanation": "Without a connected market feed or sufficient user/comparables data, market risk is not scored.",
            "verification": "Obtain independent comparable transactions and rental evidence.",
            "evidence_count": 0,
            "source_type": "Not Available",
        }

    # Location
    if user.get("latitude") is None or user.get("longitude") is None:
        location = {
            "key": "location",
            "label": "Location Risk",
            "available": False,
            "score": None,
            "band": None,
            "status": "unavailable",
            "confidence": "limited",
            "risk_detected": "Coordinates were not provided.",
            "evidence": ["Data Not Available — geospatial analysis requires latitude and longitude."],
            "explanation": "The system does not invent nearby facilities or distances.",
            "verification": "Confirm coordinates and independently review locality, access, and planning context.",
            "evidence_count": 0,
            "source_type": "Not Available",
        }
    else:
        location = {
            "key": "location",
            "label": "Location Risk",
            "available": True,
            "score": 36,
            "band": "Moderate",
            "status": "ai_inferred",
            "confidence": "limited",
            "risk_detected": "Coordinates were supplied; nearby context uses illustrative demo POIs plus calculated distances.",
            "evidence": [
                f"User coordinates: {user['latitude']}, {user['longitude']} (Verified — User Input).",
                loc.get("message") or "Illustrative Demo Data for POIs.",
            ],
            "explanation": "Distance rings are geometric only. Demo POIs are not a live map inventory and omit hazards, flood, or zoning layers.",
            "verification": "Validate neighbourhood conditions, access, and planning constraints on official maps and site inspection.",
            "evidence_count": 2,
            "source_type": "User Input + Demo Dataset",
        }

    # Infrastructure from demo POI coverage
    cats = (loc.get("categories") or {}) if loc.get("status") == "demo" else {}
    if not cats:
        infrastructure = {
            "key": "infrastructure",
            "label": "Infrastructure Risk",
            "available": False,
            "score": None,
            "band": None,
            "status": "unavailable",
            "confidence": "limited",
            "risk_detected": "Infrastructure proximity cannot be assessed.",
            "evidence": ["Data Not Available — no reliable facility inventory for this property."],
            "explanation": "The application will not fabricate hospital, school, transit, or airport distances.",
            "verification": "Confirm access to transport, utilities, and civic infrastructure independently.",
            "evidence_count": 0,
            "source_type": "Not Available",
        }
    else:
        within_3 = 0
        for items in cats.values():
            if any(i["distance_km"] <= 3 for i in items):
                within_3 += 1
        coverage = within_3 / max(len(cats), 1)
        i_score = round(max(22, min(70, 70 - coverage * 48)))
        infrastructure = {
            "key": "infrastructure",
            "label": "Infrastructure Risk",
            "available": True,
            "score": i_score,
            "band": classify(i_score),
            "status": "demo",
            "confidence": "limited",
            "risk_detected": "Infrastructure scoring uses illustrative demo points of interest only.",
            "evidence": [
                f"{within_3} of {len(cats)} demo categories have at least one POI within 3 km (haversine).",
                "POI inventory is Demo / Illustrative Data.",
            ],
            "explanation": "Coverage from synthetic POIs is not a civic-infrastructure audit.",
            "verification": "Confirm hospitals, schools, transit, and roads using official or on-ground sources.",
            "evidence_count": 2,
            "source_type": "Demo Dataset",
        }

    dims = {
        "legal": legal,
        "financial": financial,
        "market": market_dim,
        "location": location,
        "infrastructure": infrastructure,
        "documentation": documentation,
    }

    available = {k: v for k, v in dims.items() if v["available"] and v["score"] is not None}
    used_weight = sum(weights[k] for k in available)
    coverage_ratio = used_weight / sum(weights.values()) if weights else 0

    composite = {
        "available": False,
        "score": None,
        "band": None,
        "message": "Risk score cannot be reliably calculated because required evidence is incomplete.",
        "formula": "Composite = Σ (dimension score × weight) / Σ weights of available dimensions",
        "disclaimer": "AI-assisted analytical score based on available data. Not an official legal or investment rating.",
        "coverage_ratio": round(coverage_ratio, 3),
        "weights": weights,
        "excluded_dimensions": [k for k in DIMENSIONS if k not in available],
    }

    if coverage_ratio >= 0.5 and available:
        raw = sum(available[k]["score"] * weights[k] for k in available) / used_weight
        score = round(raw, 1)
        composite.update(
            {
                "available": True,
                "score": score,
                "band": classify(score),
                "message": "Composite uses only dimensions with available evidence. Missing dimensions are excluded, not assumed safe.",
            }
        )

    return {"dimensions": dims, "composite": composite}


def apply_weight_patch(current: dict, patch: dict) -> dict:
    nxt = deepcopy(current)
    for k, v in patch.items():
        if v is None or k not in nxt:
            continue
        if v < 0:
            raise ValueError("Weights cannot be negative")
        nxt[k] = float(v)
    total = sum(nxt.values())
    if total <= 0:
        raise ValueError("Weights must sum to a positive value")
    return {k: round(v / total, 4) for k, v in nxt.items()}


def default_weights() -> dict:
    return deepcopy(DEFAULT_RISK_WEIGHTS)
