from datetime import datetime, timezone
from uuid import uuid4


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id(prefix: str = "res") -> str:
    return f"{prefix}_{uuid4().hex[:12]}"


def evidence_item(
    *,
    finding: str,
    source_type: str,
    source_reference: str | None,
    evidence: str,
    agent: str,
    confidence: str,
    verification_status: str,
    extra: dict | None = None,
) -> dict:
    item = {
        "id": new_id("ev"),
        "finding": finding,
        "source_type": source_type,
        "source_reference": source_reference or "Not Available",
        "evidence": evidence,
        "timestamp": utcnow(),
        "agent": agent,
        "confidence": confidence,
        "verification_status": verification_status,
    }
    if extra:
        item.update(extra)
    return item


def agent_template(key: str, name: str, purpose: str) -> dict:
    return {
        "key": key,
        "name": name,
        "purpose": purpose,
        "current_task": "Idle",
        "input": "—",
        "output": "—",
        "status": "waiting",
        "evidence_count": 0,
        "last_activity": utcnow(),
    }


def checklist_template() -> list[dict]:
    items = [
        ("ownership", "Verify ownership documents", "Confirm title and ownership chain with original instruments."),
        ("registration", "Verify applicable registration records", "Review registration particulars through the appropriate registering authority."),
        ("encumbrance", "Review encumbrance information", "Obtain an official encumbrance / charge search covering the relevant period."),
        ("planning", "Verify applicable planning/zoning information", "Confirm land-use, planning, and local-body permissions where applicable."),
        ("measurements", "Validate property measurements", "Independently measure built-up / carpet area against sanctioned plans."),
        ("approvals", "Review applicable approvals", "Check RERA / development / occupancy approvals relevant to the asset class."),
        ("valuation", "Independently validate market valuation", "Do not rely on demo or user-estimated figures as a valuation."),
        ("official", "Review available official records where applicable", "Consult authoritative sources; this platform does not replace them."),
    ]
    out = []
    for key, title, requirement in items:
        out.append(
            {
                "key": key,
                "title": title,
                "status": "pending_verification",
                "evidence": "Not completed inside this platform.",
                "source": "Not Available",
                "verification_requirement": requirement,
            }
        )
    return out
