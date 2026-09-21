import logging
import threading
from copy import deepcopy
from typing import Any

from .config import is_demo_mode
from .evidence import agent_template, checklist_template, utcnow
from .risk_engine import default_weights

logger = logging.getLogger("propintel")

_lock = threading.Lock()
_research: dict[str, dict[str, Any]] = {}
_weights = default_weights()


def data_mode() -> str:
    return "demo" if is_demo_mode() else "connected"


def get_weights() -> dict:
    with _lock:
        return deepcopy(_weights)


def set_weights(w: dict) -> dict:
    global _weights
    with _lock:
        _weights = deepcopy(w)
        return deepcopy(_weights)


def put_research(item: dict) -> dict:
    with _lock:
        _research[item["id"]] = item
        return deepcopy(item)


def get_research(rid: str) -> dict | None:
    with _lock:
        item = _research.get(rid)
        return deepcopy(item) if item else None


def list_research() -> list[dict]:
    with _lock:
        return [deepcopy(v) for v in _research.values()]


def update_research(rid: str, mutator) -> dict | None:
    with _lock:
        item = _research.get(rid)
        if not item:
            return None
        mutator(item)
        item["updated_at"] = utcnow()
        return deepcopy(item)


def demo_system_metrics() -> dict:
    items = list_research()
    live_count = len(items)
    return {
        "label": "Demo / Sample System Metrics",
        "data_mode": data_mode(),
        "properties_researched": 128,
        "risk_assessments": 74,
        "high_risk_cases": 12,
        "research_completion_pct": 96,
        "note": "Headline counters are demonstration values for the Infosys evaluation console. They are not live production telemetry.",
        "session_research_count": live_count,
        "session_research_count_status": "verified",
        "session_note": "Session count is the number of research jobs created in this running backend process.",
    }


def empty_agents() -> list[dict]:
    return [
        agent_template(
            "property_research",
            "Property Research Agent",
            "Collects and organizes available property information from user input and uploaded files.",
        ),
        agent_template(
            "market_intelligence",
            "Market Intelligence Agent",
            "Analyzes available market and comparable-property data without inventing live prices.",
        ),
        agent_template(
            "location_intelligence",
            "Location Intelligence Agent",
            "Analyzes geographic information and nearby infrastructure when coordinates exist.",
        ),
        agent_template(
            "risk_detection",
            "Risk Detection Agent",
            "Identifies potential risk indicators strictly from available evidence.",
        ),
        agent_template(
            "report_generation",
            "Report Generation Agent",
            "Converts validated findings into a structured intelligence dossier.",
        ),
    ]


def seed_if_empty() -> None:
    if list_research():
        return
    logger.info("No seed required at import; seed is created by pipeline.seed_demo_records")
