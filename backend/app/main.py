from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from .config import MAX_UPLOAD_BYTES, gemini_configured, is_demo_mode
from .documents import DocumentError, validate_upload
from .models import ChatRequest, CompareRequest, PropertyInput, WeightUpdate
from . import gemini as gemini_mod
from . import pipeline
from . import store
from .risk_engine import apply_weight_patch

app = FastAPI(
    title="PropIntel AI",
    description="Autonomous Property Research and Real Estate Risk Assessment Intelligence System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    pipeline.seed_demo_records()


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "service": "PropIntel AI",
        "data_mode": store.data_mode(),
        "gemini_configured": gemini_configured(),
        "ai_note": "Gemini is invoked only from the backend. Keys are never sent to the browser.",
    }


@app.get("/api/meta")
def meta():
    return {
        "brand": "PropIntel AI",
        "tagline": "From Property Data to Actionable Intelligence.",
        "secondary": "Autonomous research, evidence analysis, and real-estate risk intelligence.",
        "data_mode": store.data_mode(),
        "data_mode_label": "Demo Mode" if is_demo_mode() else "Connected Data Mode",
        "gemini_configured": gemini_configured(),
        "disclaimer": (
            "PropIntel AI provides AI-assisted analytical insights based on available data. "
            "Results may be incomplete or subject to data limitations and should not be treated as "
            "legal, financial, valuation, or investment advice. Users should independently verify "
            "relevant information through appropriate authoritative sources."
        ),
        "suggested_questions": [
            "What risks were identified?",
            "What evidence supports this risk?",
            "Why is this risk classified as moderate?",
            "What information is missing?",
            "What should I verify?",
            "How does this property compare with another?",
            "Explain this report in simple language.",
        ],
    }


@app.get("/api/metrics")
def metrics():
    return store.demo_system_metrics()


@app.get("/api/weights")
def weights():
    return {"weights": store.get_weights(), "note": "Weights are used only by the deterministic risk engine."}


@app.put("/api/weights")
def update_weights(body: WeightUpdate):
    try:
        nxt = apply_weight_patch(store.get_weights(), body.model_dump())
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    return {"weights": store.set_weights(nxt)}


@app.get("/api/research")
def list_research():
    items = store.list_research()
    items.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return {"items": items, "count": len(items)}


@app.get("/api/research/{rid}")
def get_research(rid: str):
    item = store.get_research(rid)
    if not item:
        raise HTTPException(404, "Required information is unavailable to complete this assessment.")
    return item


@app.post("/api/research")
async def create_research(
    name: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    property_type: str = Form(...),
    latitude: str | None = Form(None),
    longitude: str | None = Form(None),
    estimated_price: str | None = Form(None),
    built_up_area: str | None = Form(None),
    document_types: str | None = Form(None),
    files: list[UploadFile] | None = File(default=None),
):
    def opt_float(v: str | None) -> float | None:
        if v is None or str(v).strip() == "":
            return None
        return float(v)

    try:
        payload = PropertyInput(
            name=name.strip(),
            address=address.strip(),
            city=city.strip(),
            property_type=property_type.strip(),
            latitude=opt_float(latitude),
            longitude=opt_float(longitude),
            estimated_price=opt_float(estimated_price),
            built_up_area=opt_float(built_up_area),
        )
    except ValidationError as exc:
        raise HTTPException(400, "Required information is unavailable to complete this assessment.") from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc

    types = [t.strip() for t in (document_types or "").split("|") if t.strip()]
    documents = []
    for idx, upload in enumerate(files or []):
        raw = await upload.read()
        try:
            validate_upload(upload.filename or "upload", upload.content_type, len(raw))
        except DocumentError as exc:
            raise HTTPException(400, exc.message) from exc
        if len(raw) > MAX_UPLOAD_BYTES:
            raise HTTPException(400, "The document could not be processed. Please upload a supported or clearer document.")
        documents.append(
            {
                "filename": upload.filename,
                "content_type": upload.content_type,
                "size_bytes": len(raw),
                "document_type": types[idx] if idx < len(types) else "Unspecified",
                "raw_bytes": raw,
            }
        )

    job = pipeline.create_job(payload.model_dump(), documents)
    return job


@app.post("/api/compare")
def compare(body: CompareRequest):
    return pipeline.compare_jobs(body.research_ids)


@app.post("/api/assistant")
def assistant(body: ChatRequest):
    job = store.get_research(body.research_id)
    if not job:
        raise HTTPException(404, "Required information is unavailable to complete this assessment.")
    result = gemini_mod.synthesize(job, body.question)
    return result


@app.get("/api/research/{rid}/export")
def export_json(rid: str):
    job = store.get_research(rid)
    if not job:
        raise HTTPException(404, "Required information is unavailable to complete this assessment.")
    safe = deepcopy_safe(job)
    return JSONResponse(safe)


def deepcopy_safe(job: dict) -> dict:
    import copy

    data = copy.deepcopy(job)
    for d in data.get("documents") or []:
        d.pop("raw_bytes", None)
        d.pop("extracted_text", None)
    return data


