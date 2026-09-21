import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip()
DATA_MODE = os.getenv("DATA_MODE", "demo").strip().lower()  # demo | connected

# Parse ALLOWED_ORIGINS: comma-separated list of origins
_origins_str = os.getenv("ALLOWED_ORIGINS", "").strip()
ALLOWED_ORIGINS = [o.strip() for o in _origins_str.split(",") if o.strip()]
if not ALLOWED_ORIGINS:
    ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
ALLOWED_UPLOAD_TYPES = {
    "application/pdf",
    "text/plain",
    "image/png",
    "image/jpeg",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".png", ".jpg", ".jpeg", ".docx"}

DEFAULT_RISK_WEIGHTS = {
    "legal": 0.22,
    "financial": 0.18,
    "market": 0.15,
    "location": 0.15,
    "infrastructure": 0.12,
    "documentation": 0.18,
}


def is_demo_mode() -> bool:
    return DATA_MODE != "connected"


def gemini_configured() -> bool:
    return bool(GEMINI_API_KEY)
