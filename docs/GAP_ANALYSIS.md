# Gap Analysis: Real Estate Due Diligence Agent (PropIntel AI)

## 1. Current Architecture & Stack Discovery
**Frontend:**
- **Framework:** React + Vite
- **Styling:** CSS variables, Glassmorphism, Custom Light/Dark themes
- **Routing:** React Router (`react-router-dom`)
- **Existing Pages:** Dashboard, Property Research, Intelligence Profile, Autonomous Agents, Risk Intelligence, Location Intelligence, Market Intelligence, Compare, Evidence Trail, AI Assistant, Reports.

**Backend:**
- **Language/Framework:** Python 3 + FastAPI (NOT Java/Spring Boot)
- **Database/Storage:** In-memory or minimal file-based store (via `store.py`)
- **Auth Method:** None / Mocked (No real JWT/OAuth2 implementation)
- **Core Modules:** `gemini.py` (AI Orchestrator), `pipeline.py`, `risk_engine.py`, `market.py`, `evidence.py`, `geo.py`.

---

## 2. Gap Analysis Table (Spec Requirements vs Current Status)

| Spec Module | Status | Existing Files / Components Involved | Notes / Gaps |
|-------------|--------|--------------------------------------|--------------|
| **1. User Management** | Missing / Partial | `frontend/src/pages/Login.jsx` | Only a UI mock for Login exists. Missing backend Auth, JWT, DB, Register, Profile, and Admin roles. |
| **2. Property Search** | Partial | `frontend/src/pages/Research.jsx` (Assumed via sidebar) | Basic UI exists, but needs robust DB-backed search, filters, and pagination. |
| **3. Due Diligence** | Partial / Done | `backend/app/evidence.py`, `backend/app/documents.py`, `Evidence Trail` page | AI-driven evidence extraction exists but needs DB persistence. |
| **4. Risk Assessment** | Partial / Done | `backend/app/risk_engine.py`, `Risk Intelligence` page | Deterministic risk engine exists in Python. |
| **5. Comparable Property**| Partial / Done | `backend/app/market.py`, `Compare` page | Basic comparison logic exists in Python. |
| **6. Report Generation** | Partial | `Reports` page | UI exists, needs full backend PDF/export integration. |
| **7. Notification** | Missing | None | No UI or backend logic for alerts/notifications. |
| **8. Audit Logs** | Missing | None | No tracking of user actions or AI decisions in a DB. |

---

## 3. Tech Stack Comparison & Recommendations

**Specification Stack:** Java 21, Spring Boot, Spring Security, JPA, PostgreSQL, Redis, JWT/OAuth2, Swagger, Docker, GitHub Actions, Nginx.
**Current Stack:** Python, FastAPI, No relational DB, No Redis.

**Conclusion:** The current backend is **NOT** Java/Spring Boot. It is a Python/FastAPI AI orchestrator. 

### Options Forward:

**Option A: Keep the Current Backend (Python/FastAPI) and Match Spec Features**
- *Pros:* Python is the industry standard for AI applications. Expanding the current FastAPI backend to include PostgreSQL, Redis, JWT, and Docker is very straightforward. It keeps the AI orchestration (`gemini.py`, `risk_engine.py`) native and highly performant without needing complex Java-to-Python microservices.
- *Cons:* Deviates from the "Java 21 / Spring Boot" architectural mandate in the spec.

**Option B: Migrate to Spring Boot (Java 21)**
- *Pros:* Strictly aligns with enterprise compliance, the requested spec, and Java ecosystem standards.
- *Cons:* Requires a complete rewrite of the backend. Furthermore, running native AI/Gemini orchestration and deterministic risk scoring is typically much heavier and less supported in Java compared to Python's ecosystem.

**Recommendation:** 
**Option A** is highly recommended if the primary focus of the product is AI-driven property intelligence. We can easily add PostgreSQL, JWT, and Docker to FastAPI to satisfy the enterprise requirements. 
*However, if Java 21 is a strict organizational mandate, we must proceed with **Option B** and completely rebuild the backend.*

---

## 4. Sidebar & Routing Mapping

**Existing Sidebar Pages mapping to Spec:**
- *Dashboard* → General Landing / Overview
- *Property Research, Location Intelligence* → **Module 2: Property Search**
- *Intelligence Profile, Evidence Trail* → **Module 3: Due Diligence**
- *Risk Intelligence* → **Module 4: Risk Assessment**
- *Compare, Market Intelligence* → **Module 5: Comparable Property**
- *Reports* → **Module 6: Report Generation**

**New Pages / Routes Needed:**
- `/register` → Registration Page (User Management)
- `/profile` → User Profile & Settings (User Management)
- `/admin` → Admin Dashboard (User Management)
- `/notifications` → Notifications Center (Notification Module)
- `/audit` → System Audit Logs (Audit Module)
