from fastapi import FastAPI, Header, HTTPException, Depends, Body, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
from pydantic_settings import BaseSettings
from typing import Optional, List, Dict, Any
import secrets
import asyncio
import copy
import random


class Settings(BaseSettings):
    environment: str = "development"
    database_url: str = ""
    mongodb_url: str = ""
    redis_url: str = ""
    ops_api_key: str = ""
    football_data_api_key: str = ""
    # Comma-separated list of allowed CORS origins (defaults to * in dev)
    allowed_origins: str = "*"

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


# ── WebSocket connection manager ────────────────────────────────────────────────
class ConnectionManager:
    def __init__(self) -> None:
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: Dict[str, Any]) -> None:
        dead: List[WebSocket] = []
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()

# ── Live-score simulation state ─────────────────────────────────────────────────
_INITIAL_MATCHES: List[Dict[str, Any]] = [
    {"id": "qf1", "homeTeam": {"name": "Brazil",    "flag": "🇧🇷", "code": "BRA"},
     "awayTeam": {"name": "England",   "flag": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "code": "ENG"},
     "homeScore": 2, "awayScore": 1, "status": "FT",  "minute": None,
     "venue": "AT&T Stadium, Dallas",          "round": "Quarter-Final", "date": "Jul 5, 2026"},
    {"id": "qf2", "homeTeam": {"name": "France",    "flag": "🇫🇷", "code": "FRA"},
     "awayTeam": {"name": "USA",       "flag": "🇺🇸", "code": "USA"},
     "homeScore": 3, "awayScore": 0, "status": "FT",  "minute": None,
     "venue": "MetLife Stadium, New York",     "round": "Quarter-Final", "date": "Jul 5, 2026"},
    {"id": "qf3", "homeTeam": {"name": "Argentina", "flag": "🇦🇷", "code": "ARG"},
     "awayTeam": {"name": "Germany",   "flag": "🇩🇪", "code": "GER"},
     "homeScore": 1, "awayScore": 0, "status": "LIVE", "minute": 78,
     "venue": "SoFi Stadium, Los Angeles",     "round": "Quarter-Final", "date": "Jul 6, 2026"},
    {"id": "qf4", "homeTeam": {"name": "Spain",     "flag": "🇪🇸", "code": "ESP"},
     "awayTeam": {"name": "Morocco",   "flag": "🇲🇦", "code": "MAR"},
     "homeScore": 2, "awayScore": 2, "status": "HT",  "minute": None,
     "venue": "Levi's Stadium, San Francisco", "round": "Quarter-Final", "date": "Jul 6, 2026"},
    {"id": "sf1", "homeTeam": {"name": "Brazil",    "flag": "🇧🇷", "code": "BRA"},
     "awayTeam": {"name": "France",    "flag": "🇫🇷", "code": "FRA"},
     "homeScore": None, "awayScore": None, "status": "NS", "minute": None,
     "venue": "MetLife Stadium, NY",           "round": "Semi-Final",   "date": "Jul 14, 2026"},
    {"id": "sf2", "homeTeam": {"name": "TBD",       "flag": "🏳️", "code": "TBD"},
     "awayTeam": {"name": "TBD",       "flag": "🏳️", "code": "TBD"},
     "homeScore": None, "awayScore": None, "status": "NS", "minute": None,
     "venue": "AT&T Stadium, Dallas",          "round": "Semi-Final",   "date": "Jul 15, 2026"},
]

_matches: List[Dict[str, Any]] = copy.deepcopy(_INITIAL_MATCHES)


async def _fetch_from_football_data() -> Optional[List[Dict[str, Any]]]:
    """Try football-data.org REST API. Returns None when key is absent or on error."""
    key = settings.football_data_api_key
    if not key:
        return None
    try:
        import httpx
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://api.football-data.org/v4/competitions/WC/matches",
                headers={"X-Auth-Token": key},
                params={"status": "LIVE,IN_PLAY,PAUSED,FINISHED"},
            )
            if resp.status_code != 200:
                return None
            data = resp.json()
            result: List[Dict[str, Any]] = []
            for m in data.get("matches", []):
                score_ft = m.get("score", {}).get("fullTime", {}) or {}
                score_ht = m.get("score", {}).get("halfTime", {}) or {}
                status_map = {
                    "SCHEDULED": "NS", "TIMED": "NS",
                    "IN_PLAY": "LIVE", "PAUSED": "HT",
                    "FINISHED": "FT",
                }
                raw_status = m.get("status", "SCHEDULED")
                result.append({
                    "id":       str(m["id"]),
                    "homeTeam": {"name": m["homeTeam"]["shortName"], "flag": "🏴", "code": m["homeTeam"].get("tla", "???")},
                    "awayTeam": {"name": m["awayTeam"]["shortName"], "flag": "🏴", "code": m["awayTeam"].get("tla", "???")},
                    "homeScore": score_ft.get("home"),
                    "awayScore": score_ft.get("away"),
                    "status":   status_map.get(raw_status, "NS"),
                    "minute":   m.get("minute"),
                    "venue":    m.get("venue", ""),
                    "round":    m.get("stage", ""),
                    "date":     m.get("utcDate", "")[:10],
                })
            return result if result else None
    except Exception as exc:
        print(f"[football-data] fetch error: {exc}")
        return None


def _simulate_tick(matches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Advance the simulation by one tick (~30 s)."""
    updated = copy.deepcopy(matches)
    for m in updated:
        if m["status"] == "LIVE" and m["minute"] is not None:
            m["minute"] = m["minute"] + 1
            if m["minute"] >= 90:
                m["status"] = "FT"
                m["minute"] = None
            elif random.random() < 0.04:      # ~4% goal probability per tick
                if random.random() < 0.55:
                    m["homeScore"] = (m["homeScore"] or 0) + 1
                else:
                    m["awayScore"] = (m["awayScore"] or 0) + 1
        elif m["status"] == "HT" and random.random() < 0.06:
            # Second half kicks off
            m["status"] = "LIVE"
            m["minute"] = 46
    return updated


async def _score_broadcaster() -> None:
    """Background loop: updates score state and broadcasts to all WS clients every 30 s."""
    global _matches
    while True:
        await asyncio.sleep(30)
        try:
            live = await _fetch_from_football_data()
            simulated = live is None
            if live is not None:
                _matches = live
            else:
                _matches = _simulate_tick(_matches)

            if manager.active:
                await manager.broadcast({
                    "type":      "scores_update",
                    "matches":   _matches,
                    "simulated": simulated,
                })
        except Exception as exc:
            print(f"[broadcaster] error: {exc}")


# ── App ─────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="NexGen Stadium AI API",
    description="Backend API for the FIFA World Cup 2026 Smart Operations Platform",
    version="1.0.0",
)

origins = [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup() -> None:
    asyncio.create_task(_score_broadcaster())


# ── HTTP endpoints ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for the API gateway."""
    return {
        "status": "ok",
        "version": app.version,
        "environment": settings.environment,
        "ws_clients": len(manager.active),
        "football_data_configured": bool(settings.football_data_api_key),
    }


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


# ── WebSocket endpoint ──────────────────────────────────────────────────────────
@app.websocket("/ws/scores")
async def ws_scores(websocket: WebSocket):
    """
    Real-time score stream.
    • Sends current match state immediately on connect.
    • Backend broadcaster pushes updates every 30 s.
    • Falls back to simulation when FOOTBALL_DATA_API_KEY is not set.
    """
    await manager.connect(websocket)
    try:
        # Push current state immediately
        await websocket.send_json({
            "type":      "scores_update",
            "matches":   _matches,
            "simulated": not bool(settings.football_data_api_key),
        })
        # Keep alive until client disconnects
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
