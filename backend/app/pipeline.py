import logging
from copy import deepcopy

from . import store
from .config import is_demo_mode
from .documents import extract_text
from .evidence import checklist_template, evidence_item, new_id, utcnow
from . import gemini as gemini_mod
from .geo import location_rings
from .market import market_pack
from .risk_engine import evaluate_dimensions

logger = logging.getLogger("propintel")

PHASES = [
    ("ingestion", "Phase 1 — Data Ingestion"),
    ("extraction", "Phase 2 — Document Extraction"),
    ("location", "Phase 3 — Location Analysis"),
    ("market", "Phase 4 — Market Analysis"),
    ("risk", "Phase 5 — Risk Assessment"),
    ("report", "Phase 6 — Report Generation"),
]


def _set_agent(agents: list[dict], key: str, **kwargs) -> None:
    for a in agents:
        if a["key"] == key:
            a.update(kwargs)
            a["last_activity"] = utcnow()


def _phase_map(status: str, note: str) -> list[dict]:
    return [
        {"key": k, "label": label, "status": status, "note": note}
        for k, label in PHASES
    ]


def create_job(payload: dict, documents: list[dict]) -> dict:
    rid = new_id("res")
    job = {
        "id": rid,
        "created_at": utcnow(),
        "updated_at": utcnow(),
        "data_mode": store.data_mode(),
        "input": payload,
        "documents": documents,
        "status": "processing",
        "agents": store.empty_agents(),
        "phases": _phase_map("waiting", "Queued"),
        "evidence_trail": [],
        "location": {},
        "market": {},
        "risk": {},
        "flow": [],
        "checklist": checklist_template(),
        "limitations": [],
        "report": {},
        "errors": [],
        "ai_narrative": {},
    }
    store.put_research(job)
    return run_pipeline(rid)


def run_pipeline(rid: str) -> dict:
    job = store.get_research(rid)
    if not job:
        raise KeyError(rid)

    limitations: list[str] = []
    trail: list[dict] = []
    agents = job["agents"]
    payload = job["input"]
    docs = job["documents"]

    def phase_update(key: str, status: str, note: str) -> None:
        for p in job["phases"]:
            if p["key"] == key:
                p["status"] = status
                p["note"] = note

    # Phase 1
    phase_update("ingestion", "completed", "User-provided property fields stored.")
    _set_agent(
        agents,
        "property_research",
        status="processing",
        current_task="Cataloguing property inputs",
        input="Property research request",
        output="Structured property record",
    )
    trail.append(
        evidence_item(
            finding="Property research request captured",
            source_type="User Input",
            source_reference="Research console form",
            evidence=f"{payload.get('name')} — {payload.get('address')}, {payload.get('city')}",
            agent="Property Research Agent",
            confidence="high",
            verification_status="user_provided",
        )
    )
    if payload.get("estimated_price") is None:
        limitations.append("Estimated price not provided.")
    if payload.get("built_up_area") is None:
        limitations.append("Built-up area not provided.")
    if payload.get("latitude") is None or payload.get("longitude") is None:
        limitations.append("Coordinates not provided — geospatial rings unavailable.")

    # Phase 2
    processed = []
    for doc in docs:
        raw = doc.pop("raw_bytes", None)
        if raw is None:
            doc["processing_status"] = "error"
            doc["extraction_errors"] = ["File bytes were not retained."]
            continue
        extracted = extract_text(doc["filename"], raw, doc.get("content_type"))
        doc.update(
            {
                "processing_status": "completed" if not extracted["extraction_errors"] or extracted["readable"] else "completed_with_errors",
                "extracted_fields": extracted["extracted_fields"],
                "extraction_errors": extracted["extraction_errors"],
                "readable": extracted["readable"],
                "evidence_status": "verified" if extracted["readable"] else "unavailable",
                "confidence": "medium" if extracted["readable"] else "limited",
                "ocr_used": False,
                "extraction_label": extracted["label"],
                "official_verification": False,
                "note": "Upload is not official verification of the instrument.",
            }
        )
        processed.append(doc)
        trail.append(
            evidence_item(
                finding=f"Document catalogued: {doc['filename']}",
                source_type="Uploaded Document",
                source_reference=doc["filename"],
                evidence=extracted["label"],
                agent="Property Research Agent",
                confidence=doc["confidence"],
                verification_status="uploaded_not_officially_verified",
            )
        )
    job["documents"] = processed
    if not processed:
        limitations.append("No documents uploaded.")
        phase_update("extraction", "data_unavailable", "No documents supplied.")
    else:
        phase_update("extraction", "completed", "Files validated; text extracted only where technically possible.")
    _set_agent(
        agents,
        "property_research",
        status="completed",
        current_task="Property record assembled",
        evidence_count=len(trail),
        output=f"{len(processed)} document(s) catalogued",
    )

    # Phase 3
    loc = location_rings(payload.get("latitude"), payload.get("longitude"))
    job["location"] = loc
    if loc.get("status") == "unavailable":
        phase_update("location", "data_unavailable", loc["message"])
        _set_agent(
            agents,
            "location_intelligence",
            status="data_unavailable",
            current_task="Awaiting coordinates",
            input="Latitude / longitude",
            output="Data Not Available",
        )
        trail.append(
            evidence_item(
                finding="Geospatial analysis skipped",
                source_type="Not Available",
                source_reference=None,
                evidence=loc["message"],
                agent="Location Intelligence Agent",
                confidence="limited",
                verification_status="missing_input",
            )
        )
    else:
        phase_update("location", "completed", loc["message"])
        _set_agent(
            agents,
            "location_intelligence",
            status="completed",
            current_task="Haversine rings computed on demo POIs",
            input="User coordinates",
            output="1 / 3 / 5 km rings with illustrative POIs",
            evidence_count=1,
        )
        trail.append(
            evidence_item(
                finding="Location rings calculated from user coordinates",
                source_type="Geospatial Dataset",
                source_reference="Haversine on illustrative demo POI coordinates",
                evidence=loc["message"],
                agent="Location Intelligence Agent",
                confidence="limited",
                verification_status="demo_poi_distances_calculated",
            )
        )

    # Phase 4
    market = market_pack(payload.get("city"), payload.get("estimated_price"), payload.get("built_up_area"))
    job["market"] = market
    if not market.get("available"):
        limitations.append("External market data unavailable.")
        phase_update("market", "data_unavailable", market["message"])
        _set_agent(
            agents,
            "market_intelligence",
            status="data_unavailable",
            current_task="No market feed",
            input=payload.get("city"),
            output=market["message"],
        )
        trail.append(
            evidence_item(
                finding="Market analysis limited",
                source_type="Not Available",
                source_reference=None,
                evidence=market["message"],
                agent="Market Intelligence Agent",
                confidence="limited",
                verification_status="no_live_market_feed",
            )
        )
    else:
        phase_update("market", "completed", market["message"])
        _set_agent(
            agents,
            "market_intelligence",
            status="completed",
            current_task="Attached labelled demo comparables",
            input=payload.get("city"),
            output=f"{len(market['comparables'])} demo comparables",
            evidence_count=len(market["comparables"]),
        )
        trail.append(
            evidence_item(
                finding="Illustrative market comparables attached",
                source_type="Demo Dataset",
                source_reference=market.get("source"),
                evidence=market["message"],
                agent="Market Intelligence Agent",
                confidence="limited",
                verification_status="demo_only",
            )
        )

    # Phase 5
    weights = store.get_weights()
    risk = evaluate_dimensions(job, weights)
    job["risk"] = risk
    if risk["composite"]["available"]:
        phase_update("risk", "completed", risk["composite"]["disclaimer"])
    else:
        phase_update("risk", "data_unavailable", risk["composite"]["message"])
        limitations.append(risk["composite"]["message"])
    _set_agent(
        agents,
        "risk_detection",
        status="completed" if risk["composite"]["available"] else "data_unavailable",
        current_task="Deterministic six-dimension evaluation",
        input="Evidence pack + configurable weights",
        output=risk["composite"]["band"] or "Score not reliable",
        evidence_count=sum(d.get("evidence_count") or 0 for d in risk["dimensions"].values()),
    )
    for dim in risk["dimensions"].values():
        trail.append(
            evidence_item(
                finding=dim["risk_detected"],
                source_type=dim.get("source_type") or "Not Available",
                source_reference=dim.get("source_reference"),
                evidence="; ".join(dim.get("evidence") or [])[:500],
                agent="Risk Detection Agent",
                confidence=dim.get("confidence") or "limited",
                verification_status="requires_independent_verification",
            )
        )

    # Checklist updates from evidence, not claims of official completion
    for item in job["checklist"]:
        if item["key"] in {"ownership", "registration", "encumbrance", "approvals"}:
            matching = [d for d in processed if item["key"] in (d.get("document_type") or "").lower() or (
                item["key"] == "ownership" and d.get("document_type") == "Sale Deed"
            ) or (item["key"] == "encumbrance" and d.get("document_type") == "Encumbrance Document") or (
                item["key"] == "approvals" and d.get("document_type") == "RERA Document"
            ) or (item["key"] == "registration" and d.get("document_type") == "Tax/Registration Document")]
            if matching:
                item["status"] = "document_uploaded_not_verified"
                item["evidence"] = f"{len(matching)} related file(s) uploaded; not officially verified."
                item["source"] = matching[0]["filename"]
            else:
                item["status"] = "pending_verification"
                item["evidence"] = "Data Not Available inside this platform."
                item["source"] = "Not Available"
        if item["key"] == "measurements":
            if payload.get("built_up_area"):
                item["status"] = "user_supplied_unverified"
                item["evidence"] = f"User-provided built-up area: {payload['built_up_area']}"
                item["source"] = "User Input"
            else:
                item["status"] = "pending_verification"
                item["source"] = "Not Available"
        if item["key"] == "valuation":
            if payload.get("estimated_price"):
                item["status"] = "user_supplied_unverified"
                item["evidence"] = "Estimated price is user-provided, not an independent valuation."
                item["source"] = "User Input"
            else:
                item["source"] = "Not Available"

    # Flow stages
    job["flow"] = [
        {
            "key": "ingestion",
            "title": "Data Ingestion",
            "input": "Property form fields",
            "processing": "Schema validation and storage",
            "output": "Canonical property record",
            "evidence": trail[0]["evidence"] if trail else "—",
            "status": "completed",
            "confidence": "high",
            "limitations": "Limited to what the user entered.",
        },
        {
            "key": "extraction",
            "title": "Document Extraction",
            "input": f"{len(processed)} file(s)",
            "processing": "Type/size validation; text extraction where implemented (no image OCR)",
            "output": "Catalog + optional text preview",
            "evidence": f"{len(processed)} processed",
            "status": "completed" if processed else "data_unavailable",
            "confidence": "medium" if any(d.get("readable") for d in processed) else "limited",
            "limitations": "OCR is not implemented for images. Upload ≠ official verification.",
        },
        {
            "key": "geo",
            "title": "Geospatial Analysis",
            "input": "Latitude / longitude if provided",
            "processing": "Haversine distance to illustrative demo POIs",
            "output": "1 / 3 / 5 km rings",
            "evidence": loc.get("message"),
            "status": loc.get("status"),
            "confidence": "limited",
            "limitations": "POIs are Demo / Illustrative Data. No live maps API.",
        },
        {
            "key": "market",
            "title": "Market Intelligence",
            "input": "City, optional price and area",
            "processing": "Attach labelled demo comparables when a city pack exists",
            "output": market.get("data_label"),
            "evidence": market.get("message"),
            "status": "demo" if market.get("available") else "unavailable",
            "confidence": "limited",
            "limitations": "No live listing or registration feed is connected.",
        },
        {
            "key": "risk",
            "title": "Risk Assessment",
            "input": "Evidence pack + weights",
            "processing": "Deterministic six-dimension engine (AI does not compute the score)",
            "output": risk["composite"]["band"] or "Unavailable",
            "evidence": risk["composite"]["message"],
            "status": "completed" if risk["composite"]["available"] else "unavailable",
            "confidence": "limited" if risk["composite"]["coverage_ratio"] < 0.85 else "medium",
            "limitations": "Missing official legal records are excluded, not treated as clear.",
        },
        {
            "key": "verify",
            "title": "Verification Checklist",
            "input": "Documents + user fields",
            "processing": "Map available artefacts to verification tasks",
            "output": "Checklist with pending independent verification",
            "evidence": "No checklist item is marked officially complete by this system.",
            "status": "completed",
            "confidence": "high",
            "limitations": "Checklist tracks work remaining; it is not a clearance certificate.",
        },
        {
            "key": "report",
            "title": "Intelligence Report",
            "input": "Validated findings",
            "processing": "Assemble 10-section dossier",
            "output": "Property Intelligence Dossier",
            "evidence": "Report generated from stored evidence only",
            "status": "completed",
            "confidence": "medium",
            "limitations": "Narratives marked AI-inferred when Gemini is used.",
        },
    ]

    price_psf = None
    status_psf = "unavailable"
    if payload.get("estimated_price") and payload.get("built_up_area"):
        price_psf = round(payload["estimated_price"] / payload["built_up_area"], 2)
        status_psf = "verified"

    job["profile"] = {
        "name": payload["name"],
        "location": f"{payload['city']}",
        "address": payload["address"],
        "fields": [
            {"label": "Property Type", "value": payload["property_type"], "origin": "verified", "note": "User Input"},
            {
                "label": "Estimated Value",
                "value": payload.get("estimated_price"),
                "origin": "verified" if payload.get("estimated_price") is not None else "unavailable",
                "note": "User Input" if payload.get("estimated_price") is not None else "Data Not Available",
            },
            {
                "label": "Built-up Area",
                "value": payload.get("built_up_area"),
                "origin": "verified" if payload.get("built_up_area") is not None else "unavailable",
                "note": "User Input" if payload.get("built_up_area") is not None else "Data Not Available",
            },
            {
                "label": "Price per sq.ft",
                "value": price_psf,
                "origin": status_psf,
                "note": "Derived from user price ÷ area" if price_psf is not None else "Data Not Available",
            },
            {
                "label": "Rental Yield",
                "value": None,
                "origin": "unavailable",
                "note": "Data Not Available — rental income not provided; not inferred.",
            },
            {"label": "Location", "value": payload["city"], "origin": "verified", "note": "User Input"},
            {"label": "Research Status", "value": "Completed with data limitations", "origin": "verified", "note": "Pipeline status"},
        ],
    }

    if is_demo_mode():
        limitations.append("DATA MODE is Demo Mode — sample datasets are labelled and must not be read as live official records.")

    limitations.append("External legal registries (RERA / CMDA / court / registration) are not connected.")
    job["limitations"] = limitations
    job["evidence_trail"] = trail
    job["agents"] = agents

    report = build_report(job)
    job["report"] = report
    phase_update("report", "completed", "Ten-section dossier assembled from stored evidence.")
    _set_agent(
        agents,
        "report_generation",
        status="completed",
        current_task="Dossier assembled",
        input="Validated findings",
        output="Property Intelligence Dossier",
        evidence_count=len(trail),
    )

    narrative = gemini_mod.narrative_sections(job)
    job["ai_narrative"] = narrative
    job["status"] = "completed"
    job["errors"] = []
    return store.put_research(job)


def build_report(job: dict) -> dict:
    risk = job.get("risk") or {}
    return {
        "title": "Property Intelligence Dossier",
        "property_name": job["input"]["name"],
        "generated_at": utcnow(),
        "data_mode": job["data_mode"],
        "disclaimer": (
            "PropIntel AI provides AI-assisted analytical insights based on available data. "
            "Results may be incomplete or subject to data limitations and should not be treated as "
            "legal, financial, valuation, or investment advice. Users should independently verify "
            "relevant information through appropriate authoritative sources."
        ),
        "sections": [
            {"n": 1, "title": "Executive Summary"},
            {"n": 2, "title": "Property Overview"},
            {"n": 3, "title": "Document Intelligence"},
            {"n": 4, "title": "Location Intelligence"},
            {"n": 5, "title": "Market Intelligence"},
            {"n": 6, "title": "Risk Assessment"},
            {"n": 7, "title": "Comparable Properties"},
            {"n": 8, "title": "Evidence & Confidence"},
            {"n": 9, "title": "Verification Checklist"},
            {"n": 10, "title": "Research Summary"},
        ],
        "composite": risk.get("composite"),
        "limitations": job.get("limitations"),
    }


def compare_jobs(ids: list[str]) -> dict:
    rows = []
    for i in ids:
        job = store.get_research(i)
        if not job:
            continue
        inp = job["input"]
        psf = None
        if inp.get("estimated_price") and inp.get("built_up_area"):
            psf = round(inp["estimated_price"] / inp["built_up_area"], 2)
        comp = (job.get("risk") or {}).get("composite") or {}
        docs = job.get("documents") or []
        loc_status = (job.get("location") or {}).get("status")
        rows.append(
            {
                "id": job["id"],
                "property": inp["name"],
                "price": inp.get("estimated_price"),
                "price_status": "verified" if inp.get("estimated_price") is not None else "unavailable",
                "psf": psf,
                "psf_status": "verified" if psf is not None else "unavailable",
                "rental_yield": None,
                "rental_yield_status": "unavailable",
                "market_indicator": (job.get("market") or {}).get("data_label") or "DATA NOT AVAILABLE",
                "location": inp.get("city"),
                "risk_exposure": comp.get("band") or "Unavailable",
                "risk_score": comp.get("score"),
                "infrastructure": "Demo POI rings" if loc_status == "demo" else "Data Not Available",
                "documentation": f"{len(docs)} file(s)",
                "confidence": "limited" if (comp.get("coverage_ratio") or 0) < 0.85 else "medium",
            }
        )
    diffs = []
    if len(rows) >= 2:
        a, b = rows[0], rows[1]
        if a["psf"] is not None and b["psf"] is not None:
            lower = a if a["psf"] < b["psf"] else b
            higher = b if lower is a else a
            diffs.append(
                f"{lower['property']} has a lower displayed price per sq.ft than {higher['property']} based on the available dataset (user-provided price ÷ area)."
            )
        elif a["psf"] is None or b["psf"] is None:
            diffs.append("Price per sq.ft cannot be compared for every property because required inputs are missing.")
        if a["risk_score"] is not None and b["risk_score"] is not None:
            diffs.append(
                f"Displayed composite analytical scores differ ({a['property']}: {a['risk_score']}, {b['property']}: {b['risk_score']}). Scores are AI-assisted analytics on available data, not investment rankings."
            )
        diffs.append("No winner, best property, or recommendation is issued.")
    return {"rows": rows, "key_differences": diffs, "note": "Comparison is analytical only and does not recommend a purchase."}


def seed_demo_records() -> None:
    if store.list_research():
        return
    samples = [
        {
            "name": "Green Valley Residency",
            "address": "OMR, Sholinganallur",
            "city": "Chennai, Tamil Nadu",
            "latitude": 13.0827,
            "longitude": 80.2707,
            "property_type": "Apartment",
            "estimated_price": 12500000,
            "built_up_area": 1480,
        },
        {
            "name": "Sunrise Heights",
            "address": "Whitefield Main Road",
            "city": "Bengaluru, Karnataka",
            "latitude": 12.9698,
            "longitude": 77.7499,
            "property_type": "Apartment",
            "estimated_price": 18200000,
            "built_up_area": 1720,
        },
        {
            "name": "Incomplete Parcel Record",
            "address": "Address not fully specified",
            "city": "Hyderabad",
            "latitude": None,
            "longitude": None,
            "property_type": "Plot",
            "estimated_price": None,
            "built_up_area": None,
        },
    ]
    for payload in samples:
        create_job(payload, [])
    logger.info("Seeded %s demo research jobs", len(samples))
