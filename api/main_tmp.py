from fastapi import FastAPI, Header, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
from pydantic_settings import BaseSettings
from typing import Optional
import secrets


class Settings(BaseSettings):
    environment: str = "development"
    database_url: str = ""
    mongodb_url: str = ""
    redis_url: str = ""
    ops_api_key: str = "staff-demo-key-2026"  # Override via OPS_API_KEY env var

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }


settings = Settings()

# ── Security ────────────────────────────────────────────────────────────────────
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def require_ops_key(x_api_key: Optional[str] = Depends(api_key_header)) -> str:
    """FastAPI dependency that enforces staff API key for ops endpoints."""
    if not x_api_key or not secrets.compare_digest(x_api_key.strip(), settings.ops_api_key):
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing staff API key. Contact your operations manager.",
        )
    return x_api_key


# ── Pydantic models ─────────────────────────────────────────────────────────────
class AssistantQuery(BaseModel):
    message: str
    language: str = "en"
    role: str = "fan"
    zone: str = ""
    intent_hint: Optional[str] = None


class AccessibilityRequest(BaseModel):
    kind: str
    zone: str
    details: str
    contact: str


class CrowdSample(BaseModel):
    zone: str
    density_pct: float
    flow_rate: float


settings = Settings()

app = FastAPI(
    title="NexGen Stadium AI API",
    description="Backend API for the FIFA World Cup 2026 Smart Operations Platform",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for the API gateway."""
    return {
        "status": "ok",
        "version": app.version,
        "environment": settings.environment,
    }

# Stub out the other endpoints for frontend compatibility
@app.post("/assistant/query", tags=["GenAI"])
async def assistant_query(body: AssistantQuery):
    """AI assistant stub — returns a role-aware multilingual response."""
    return {
        "intent": body.intent_hint or "general",
        "reply": f"Hello! I'm Stadium Copilot. You asked: '{body.message}'. How can I help you today at FIFA World Cup 2026?",
        "suggested_action": None,
        "language": body.language,
        "escalated": False,
    }


@app.post("/accessibility/request", tags=["Accessibility"])
async def accessibility_request(body: AccessibilityRequest):
    """Accessibility support request — creates a stub ticket."""
    return {
        "ticket_id": f"ACC-{hash(body.contact) % 90000 + 10000}",
        "status": "open",
        "eta_minutes": 8,
    }


@app.post("/ops/crowd-advisory", tags=["Operations"])
async def crowd_advisory(
    body: CrowdSample,
    _key: str = Depends(require_ops_key),
):
    """Staff-only crowd advisory. Requires X-API-Key header."""
    # Simple rule-based risk assignment (replace with ML model in production)
    if body.density_pct >= 90 or body.flow_rate < 30:
        risk = "critical"
        actions = ["Activate emergency dispersal protocol", "Alert security command", "Close entry gates"]
        summary = f"Zone {body.zone} is critically congested at {body.density_pct:.0f}% density with near-zero flow."
    elif body.density_pct >= 70:
        risk = "high"
        actions = ["Redirect fans via Gate C", "Deploy additional staff", "Monitor every 5 minutes"]
        summary = f"Zone {body.zone} shows high density ({body.density_pct:.0f}%). Increased monitoring required."
    elif body.density_pct >= 45:
        risk = "moderate"
        actions = ["Standard monitoring", "Prepare overflow route"]
        summary = f"Zone {body.zone} is moderately busy at {body.density_pct:.0f}% density."
    else:
        risk = "low"
        actions = ["Continue standard patrols"]
        summary = f"Zone {body.zone} is operating normally at {body.density_pct:.0f}% density."

    return {
        "zone": body.zone,
        "risk_level": risk,
        "summary": summary,
        "recommended_actions": actions,
    }
