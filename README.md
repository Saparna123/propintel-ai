# PropIntel AI

**From Property Data to Actionable Intelligence.**  
Autonomous research, evidence analysis, and real-estate risk intelligence.

Infosys evaluation console: an enterprise **property intelligence** platform — not a listings marketplace.

Core loop: **Property Data → Autonomous Research → Evidence → Intelligence Analysis → Risk Assessment → Verification Guidance → Intelligence Report**

## Responsible AI

The system does **not** fabricate government, RERA, CMDA, court, ownership, valuation, or live market facts. Missing information is shown as **Data Not Available** or **Demo / Illustrative Data**.

Language: the product never states that a property is legally or financially “safe”. It reports what the evidence supports and what the user should independently verify.

## Architecture

```
Frontend (React + Vite)
  → API (FastAPI)
    → AI Orchestrator / Gemini (backend only)
    → Specialized agents
    → Deterministic risk engine
    → Evidence store
    → Report generator
```

Numeric risk scores, distances (haversine), validation, and aggregations are **deterministic**. Gemini is used for narrative and Q&A only, with the stored evidence pack as the sole factual context.

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Optional: set GEMINI_API_KEY in .env (never in the frontend)
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to port 8000.

### Data mode

`DATA_MODE=demo` (default) shows a visible **DEMO DATA** chip. Headline dashboard counters are labelled **Demo / Sample System Metrics**. Session research jobs in this process are real in-memory records.

## Security

- `GEMINI_API_KEY` lives only in `backend/.env`
- File type and 10 MB size validation
- Input validation on coordinates and numeric fields
- CORS limited to the local Vite origin

## Disclaimer

PropIntel AI provides AI-assisted analytical insights based on available data. Results may be incomplete or subject to data limitations and should not be treated as legal, financial, valuation, or investment advice. Users should independently verify relevant information through appropriate authoritative sources.
