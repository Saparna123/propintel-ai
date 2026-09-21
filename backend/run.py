import os
import uvicorn

if __name__ == "__main__":
    # Use PORT from environment or fallback to 8000
    port = int(os.environ.get("PORT", 8000))
    # Production deployment-friendly startup (no reload by default)
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
