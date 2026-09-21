import logging
from typing import Any

from .config import GEMINI_MODEL, GEMINI_API_KEY, gemini_configured

logger = logging.getLogger("propintel")

SYSTEM_RULES = """You are PropIntel AI, an enterprise property research assistant.

Hard rules:
- Never fabricate government, RERA, CMDA, registration, court, ownership, valuation, or market facts.
- Never invent sources, documents, distances, or official verification.
- Never give legal, financial, valuation, or investment advice.
- Never say a property is legally safe, financially safe, or a guaranteed investment.
- Prefer: "No relevant issue was identified in the available data. Independent verification is recommended."
- If information is missing: "The available data is insufficient to determine this."
- Use only the JSON evidence pack provided by the backend. If a field is missing, say so.
- Structure every answer as:
  Answer
  Evidence
  Explanation
  Data Limitation
  Verification Guidance
- Speak professionally. Do not be salesy.
"""


def _client():
    if not gemini_configured():
        return None
    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        return genai.GenerativeModel(GEMINI_MODEL)
    except Exception as exc:
        logger.exception("Gemini client init failed: %s", exc)
        return None


def synthesize(research: dict[str, Any], question: str) -> dict[str, Any]:
    pack = {
        "property": research.get("input"),
        "data_mode": research.get("data_mode"),
        "documents": [
            {
                "name": d.get("filename"),
                "type": d.get("document_type"),
                "status": d.get("processing_status"),
                "errors": d.get("extraction_errors"),
                "readable": d.get("readable"),
            }
            for d in research.get("documents") or []
        ],
        "risk": research.get("risk"),
        "market_message": (research.get("market") or {}).get("message"),
        "location_message": (research.get("location") or {}).get("message"),
        "evidence_trail": research.get("evidence_trail") or [],
        "checklist": research.get("checklist") or [],
        "limitations": research.get("limitations") or [],
    }

    if not gemini_configured():
        return {
            "ok": False,
            "code": "ai_service_unavailable",
            "message": "AI analysis is temporarily unavailable. Previously processed evidence remains accessible.",
            "structured": fallback_structure(research, question),
        }

    model = _client()
    if model is None:
        return {
            "ok": False,
            "code": "ai_service_unavailable",
            "message": "AI analysis is temporarily unavailable. Previously processed evidence remains accessible.",
            "structured": fallback_structure(research, question),
        }

    prompt = (
        f"{SYSTEM_RULES}\n\nUser question:\n{question}\n\nEvidence pack (authoritative; do not contradict):\n{pack}"
    )
    try:
        result = model.generate_content(prompt)
        text = (result.text or "").strip()
        if not text:
            raise ValueError("empty model text")
        return {
            "ok": True,
            "code": "ok",
            "message": text,
            "model": GEMINI_MODEL,
            "structured": None,
        }
    except Exception as exc:
        logger.warning("Gemini call failed: %s", exc)
        return {
            "ok": False,
            "code": "ai_service_unavailable",
            "message": "AI analysis is temporarily unavailable. Previously processed evidence remains accessible.",
            "structured": fallback_structure(research, question),
        }


def fallback_structure(research: dict, question: str) -> dict:
    risk = research.get("risk") or {}
    dims = (risk.get("dimensions") or {}).values()
    findings = [
        f"{d['label']}: {d.get('risk_detected')}"
        for d in dims
        if d.get("risk_detected")
    ]
    evidence = [e.get("finding") for e in (research.get("evidence_trail") or [])[:8]]
    missing = research.get("limitations") or []
    return {
        "answer": (
            "Deterministic evidence summary (Gemini not used or unavailable). "
            "This is not legal, financial, valuation, or investment advice."
        ),
        "evidence": evidence or findings[:6] or ["The available data is insufficient to determine this."],
        "explanation": f"Question received: {question}. Responses are constrained to stored evidence for this research job.",
        "data_limitation": missing[0] if missing else "Assessment is limited to user input, uploaded files, and labelled demo datasets.",
        "verification_guidance": "Independently verify ownership, registration, encumbrance, planning, measurements, and valuation through authoritative sources.",
    }


def narrative_sections(research: dict) -> dict:
    """Optional Gemini narratives; always labelled as AI-inferred."""
    if not gemini_configured():
        return {}
    model = _client()
    if model is None:
        return {}
    prompt = (
        f"{SYSTEM_RULES}\nWrite a short executive summary (max 120 words) and a research summary (max 120 words) "
        "based only on this pack. If legal data is missing, say so. JSON keys: executive_summary, research_summary.\n"
        f"Pack: property={research.get('input')}, composite={ (research.get('risk') or {}).get('composite') }, "
        f"limitations={research.get('limitations')}"
    )
    try:
        result = model.generate_content(prompt)
        text = (result.text or "").strip()
        return {"ai_narrative_raw": text, "status": "ai_inferred"}
    except Exception:
        return {}
