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



# ── Assistant intent engine ─────────────────────────────────────────────────────
_INTENTS: list[dict] = [
    {
        "name": "restroom",
        "keywords": ["restroom", "toilet", "bathroom", "wc", "washroom", "lavatory", "loo", "baño", "toilette"],
        "responses": {
            "en": lambda zone: f"The nearest restrooms in {zone or 'your area'} are located at every concourse level — look for the blue 'WC' signs. There are also accessible restrooms with wider stalls near Gate C and Gate H.",
            "es": lambda zone: f"Los baños más cercanos en {zone or 'su área'} están en cada nivel del pasillo. Busque los letreros azules 'WC'. También hay baños accesibles cerca de la Puerta C y la Puerta H.",
            "fr": lambda zone: f"Les toilettes les plus proches à {zone or 'votre zone'} se trouvent à chaque niveau du concourse — cherchez les panneaux bleus 'WC'. Des toilettes accessibles se trouvent aussi près des Portes C et H.",
            "ar": lambda zone: f"أقرب دورات المياه في {zone or 'منطقتك'} موجودة في كل طابق — ابحث عن لافتات 'WC' الزرقاء. هناك أيضاً دورات مياه للذوي الاحتياجات الخاصة بالقرب من البوابتين C وH.",
            "pt": lambda zone: f"Os banheiros mais próximos em {zone or 'sua área'} estão localizados em cada nível — procure as placas azuis 'WC'. Há também banheiros acessíveis perto dos Portões C e H.",
        },
        "suggested_action": "Navigate to nearest WC",
        "escalated": False,
    },
    {
        "name": "food",
        "keywords": ["food", "eat", "hungry", "restaurant", "snack", "drink", "beverage", "burger", "pizza", "concession", "comida", "manger", "boire"],
        "responses": {
            "en": lambda zone: f"Food and beverage stands are on every concourse level in {zone or 'all zones'}. Look for green 'Food & Drinks' banners. The main food court is on Level 2. Dietary options (vegan, halal, gluten-free) are available at stands marked with a leaf icon.",
            "es": lambda zone: f"Los puestos de comida están en cada nivel del estadio en {zone or 'todas las zonas'}. El patio de comidas principal está en el Nivel 2.",
            "fr": lambda zone: f"Les stands de nourriture se trouvent à chaque niveau dans {zone or 'toutes les zones'}. La restauration principale est au Niveau 2.",
            "ar": lambda zone: f"أكشاك الطعام والمشروبات موجودة في كل طابق في {zone or 'جميع المناطق'}. منطقة الطعام الرئيسية في الطابق الثاني.",
            "pt": lambda zone: f"As barracas de comida estão em todos os níveis em {zone or 'todas as zonas'}. A praça de alimentação principal fica no Nível 2.",
        },
        "suggested_action": "View food court map",
        "escalated": False,
    },
    {
        "name": "gate",
        "keywords": ["gate", "entrance", "entry", "exit", "puerta", "porte", "eingang", "enter", "door", "access"],
        "responses": {
            "en": lambda zone: f"Gates A–D are on the North side, Gates E–H on the South. If you're in {zone or 'the stadium'}, the nearest exit is clearly marked with green arrows on overhead signs. Gates open 3 hours before kickoff.",
            "es": lambda zone: f"Las puertas A–D están en el lado Norte, las E–H en el Sur. Las salidas están marcadas con flechas verdes. Las puertas abren 3 horas antes del partido.",
            "fr": lambda zone: f"Les portes A–D sont au Nord, les E–H au Sud. Les sorties sont signalées par des flèches vertes. Les portes ouvrent 3 heures avant le coup d'envoi.",
            "ar": lambda zone: f"البوابات A–D في الجهة الشمالية، والبوابات E–H في الجهة الجنوبية. تُفتح البوابات قبل 3 ساعات من انطلاق المباراة.",
            "pt": lambda zone: f"As entradas A–D ficam no lado Norte, E–H no Sul. As saídas estão marcadas com setas verdes. As portões abrem 3 horas antes do jogo.",
        },
        "suggested_action": "Show gate map",
        "escalated": False,
    },
    {
        "name": "emergency",
        "keywords": ["emergency", "danger", "fire", "threat", "bomb", "attack", "evacuate", "evacuation", "urgent", "help", "danger", "unsafe", "urgencia", "urgence"],
        "responses": {
            "en": lambda zone: f"🚨 EMERGENCY — Please stay calm. Follow the green EXIT signs to the nearest evacuation point. Stadium security has been alerted. Call 911 or find the nearest staff member wearing a red vest in {zone or 'your zone'}.",
            "es": lambda zone: f"🚨 EMERGENCIA — Mantenga la calma. Siga las señales verdes de SALIDA. La seguridad del estadio ha sido alertada. Llame al 911 o busque personal con chaleco rojo en {zone or 'su zona'}.",
            "fr": lambda zone: f"🚨 URGENCE — Restez calme. Suivez les panneaux verts SORTIE. La sécurité est alertée. Appelez le 911 ou trouvez un agent en gilet rouge dans {zone or 'votre zone'}.",
            "ar": lambda zone: f"🚨 طارئ — ابق هادئاً. اتبع علامات الخروج الخضراء. تم إبلاغ أمن الملعب. اتصل بـ 911 أو اعثر على أحد الموظفين ذوي السترة الحمراء في {zone or 'منطقتك'}.",
            "pt": lambda zone: f"🚨 EMERGÊNCIA — Mantenha a calma. Siga as placas verdes de SAÍDA. A segurança foi alertada. Ligue 911 ou encontre um funcionário com colete vermelho em {zone or 'sua zona'}.",
        },
        "suggested_action": "Alert security",
        "escalated": True,
    },
    {
        "name": "first_aid",
        "keywords": ["first aid", "medical", "ambulance", "injured", "hurt", "sick", "faint", "doctor", "nurse", "medicina", "médico", "blessé", "malade"],
        "responses": {
            "en": lambda zone: f"The nearest First Aid station in {zone or 'the stadium'} is marked with a red cross on all signage. Medical staff are stationed at Sections 101, 220, and near Gate F. For serious emergencies, shout for help or call stadium security at ext. 555.",
            "es": lambda zone: f"La estación de primeros auxilios más cercana en {zone or 'el estadio'} está marcada con una cruz roja. Hay personal médico en las Secciones 101, 220 y cerca de la Puerta F.",
            "fr": lambda zone: f"Le poste de premiers secours le plus proche à {zone or 'le stade'} est signalé par une croix rouge. Des médecins se trouvent aux Sections 101, 220 et près de la Porte F.",
            "ar": lambda zone: f"أقرب محطة إسعافات أولية في {zone or 'الملعب'} مُعلّمة بعلامة الصليب الأحمر. يتواجد الطاقم الطبي في الأقسام 101 و220 وبالقرب من البوابة F.",
            "pt": lambda zone: f"O posto de primeiros socorros mais próximo em {zone or 'o estádio'} está marcado com uma cruz vermelha. Há equipe médica nas Seções 101, 220 e perto do Portão F.",
        },
        "suggested_action": "Find first aid station",
        "escalated": True,
    },
    {
        "name": "ticket",
        "keywords": ["ticket", "seat", "section", "row", "seat number", "standing", "upgrade", "ticket office", "entrada", "billet", "bilhete"],
        "responses": {
            "en": lambda zone: f"Your ticket barcode is your access pass — keep it in the Wallet app for fast scanning. The Ticket Help Desk is at the main entrance lobby. For seat upgrades or lost tickets, visit Guest Services at Gate A.",
            "es": lambda zone: f"El código de barras de su boleto es su pase de acceso. El servicio de atención al cliente para boletos está en la entrada principal.",
            "fr": lambda zone: f"Votre code-barres de billet est votre laissez-passer. Le service des billets est dans le hall principal.",
            "ar": lambda zone: f"رمز الباركود في تذكرتك هو بطاقة دخولك. تجد مكتب خدمة التذاكر عند المدخل الرئيسي.",
            "pt": lambda zone: f"O código de barras do seu ingresso é seu passe de acesso. O serviço de ingressos fica no saguão principal.",
        },
        "suggested_action": "Go to Guest Services",
        "escalated": False,
    },
    {
        "name": "schedule",
        "keywords": ["schedule", "match", "game", "kickoff", "kick-off", "when", "time", "fixture", "horario", "match schedule", "programme"],
        "responses": {
            "en": lambda zone: "Today's featured match is Argentina 🇦🇷 vs Germany 🇩🇪 at SoFi Stadium (Quarter-Final, live now in the 78th minute). Semi-Finals are on July 14 & 15 at MetLife Stadium. Check the Schedule tab in the app for the full fixture list.",
            "es": lambda zone: "El partido de hoy es Argentina 🇦🇷 vs Alemania 🇩🇪 en SoFi Stadium (Cuartos de Final, en vivo). Las Semifinales son el 14 y 15 de julio.",
            "fr": lambda zone: "Le match du jour est Argentine 🇦🇷 vs Allemagne 🇩🇪 au SoFi Stadium (Quart de finale, en cours). Les Demi-finales sont les 14 et 15 juillet.",
            "ar": lambda zone: "مباراة اليوم: الأرجنتين 🇦🇷 ضد ألمانيا 🇩🇪 في ملعب SoFi (ربع النهائي، جارية الآن). نصف النهائيات في 14 و15 يوليو.",
            "pt": lambda zone: "O jogo de hoje é Argentina 🇦🇷 vs Alemanha 🇩🇪 no SoFi Stadium (Quartas de Final, ao vivo). As Semifinais são em 14 e 15 de julho.",
        },
        "suggested_action": "View full schedule",
        "escalated": False,
    },
    {
        "name": "wifi",
        "keywords": ["wifi", "wi-fi", "internet", "network", "connect", "password", "hotspot", "signal"],
        "responses": {
            "en": lambda zone: "Free stadium Wi-Fi: connect to 'FIFA2026_Guest' (no password needed). For faster speeds, the premium 'FIFA2026_Premium' network is available with your match ticket QR code as the password.",
            "es": lambda zone: "Wi-Fi gratuito: conéctese a 'FIFA2026_Guest'. La red premium 'FIFA2026_Premium' usa el QR de su boleto como contraseña.",
            "fr": lambda zone: "Wi-Fi gratuit: connectez-vous à 'FIFA2026_Guest'. Le réseau premium 'FIFA2026_Premium' utilise le QR de votre billet comme mot de passe.",
            "ar": lambda zone: "الواي فاي المجاني: اتصل بـ 'FIFA2026_Guest'. الشبكة المميزة 'FIFA2026_Premium' تستخدم رمز QR الخاص بتذكرتك كلمةً للمرور.",
            "pt": lambda zone: "Wi-Fi gratuito: conecte-se a 'FIFA2026_Guest'. A rede premium 'FIFA2026_Premium' usa o QR do ingresso como senha.",
        },
        "suggested_action": "Connect to stadium Wi-Fi",
        "escalated": False,
    },
    {
        "name": "transport",
        "keywords": ["bus", "train", "taxi", "transport", "uber", "parking", "car", "metro", "shuttle", "drop off", "pickup", "transport", "trajet"],
        "responses": {
            "en": lambda zone: "Shuttle buses run every 15 minutes from the stadium to downtown and all designated parking zones. The rideshare pickup zone is at Gate H, North Lot. The nearest metro station is a 5-minute walk from Gate A — take Line 3 toward Downtown.",
            "es": lambda zone: "Los autobuses lanzadera salen cada 15 minutos. La zona de recogida de rideshare está en la Puerta H. La estación de metro más cercana está a 5 minutos de la Puerta A.",
            "fr": lambda zone: "Les navettes partent toutes les 15 minutes. La zone de prise en charge rideshare est à la Porte H. La station de métro la plus proche est à 5 minutes de la Porte A.",
            "ar": lambda zone: "الحافلات المكوكية تنطلق كل 15 دقيقة. منطقة الإنزال للتوصيل المشترك عند البوابة H. أقرب محطة مترو على بُعد 5 دقائق من البوابة A.",
            "pt": lambda zone: "Ônibus especiais a cada 15 minutos. A zona de embarque rideshare fica no Portão H. A estação de metrô mais próxima fica a 5 minutos do Portão A.",
        },
        "suggested_action": "View transport options",
        "escalated": False,
    },
    {
        "name": "accessibility",
        "keywords": ["wheelchair", "disabled", "disability", "accessible", "hearing", "visual", "blind", "deaf", "ramp", "elevator", "lift", "discapacidad", "handicap"],
        "responses": {
            "en": lambda zone: f"Accessible entrances, wheelchair ramps, and companion seating are available at Gates B, D, and F. Dedicated accessible restrooms are on every level. Hearing loop systems are active in all seating sections. In {zone or 'your area'}, please ask a staff member for personal escort assistance.",
            "es": lambda zone: f"Entradas accesibles y rampas para sillas de ruedas en las Puertas B, D y F. Hay asientos para acompañantes y baños accesibles en cada nivel.",
            "fr": lambda zone: f"Entrées accessibles et rampes pour fauteuils roulants aux Portes B, D et F. Des systèmes de boucle auditive sont actifs dans toutes les sections.",
            "ar": lambda zone: f"المداخل المخصصة وكراسي الإعاقة متاحة عند البوابات B وD وF. أنظمة حلقات السمع نشطة في جميع الأقسام.",
            "pt": lambda zone: f"Entradas acessíveis e rampas para cadeiras de rodas nas Portões B, D e F. Sistemas de laço auditivo ativos em todas as seções.",
        },
        "suggested_action": "Request accessibility assistance",
        "escalated": False,
    },
]

_FALLBACK: dict = {
    "en": lambda msg, zone, role: f"I'm Stadium Copilot, your FIFA World Cup 2026 assistant! I couldn't find specific info for '{msg}', but our staff are here to help. You can also visit the Information Desk at the main entrance, or ask me about: restrooms, food, gates, schedules, transport, Wi-Fi, first aid, or accessibility.",
    "es": lambda msg, zone, role: f"Soy Stadium Copilot, su asistente de la Copa Mundial FIFA 2026. No encontré información específica para '{msg}'. Visite el Mostrador de Información en la entrada principal.",
    "fr": lambda msg, zone, role: f"Je suis Stadium Copilot, votre assistant pour la Coupe du Monde FIFA 2026. Je n'ai pas trouvé d'info précise pour '{msg}'. Consultez le bureau d'information à l'entrée principale.",
    "ar": lambda msg, zone, role: f"أنا Stadium Copilot، مساعدك في كأس العالم FIFA 2026. لم أجد معلومات محددة حول '{msg}'. يمكنك زيارة مكتب الاستعلامات عند المدخل الرئيسي.",
    "pt": lambda msg, zone, role: f"Sou o Stadium Copilot, seu assistente para a Copa do Mundo FIFA 2026. Não encontrei informações específicas para '{msg}'. Visite a central de informações na entrada principal.",
}

_ROLE_PREFIXES: dict[str, str] = {
    "fan":         "",
    "staff":       "🔒 Staff View — ",
    "medic":       "🏥 Medical — ",
    "security":    "🛡️ Security — ",
    "vip":         "⭐ VIP Concierge — ",
    "media":       "📡 Media — ",
    "volunteer":   "🤝 Volunteer — ",
}


def _detect_intent(message: str) -> dict | None:
    lower = message.lower()
    for intent in _INTENTS:
        if any(kw in lower for kw in intent["keywords"]):
            return intent
    return None


@app.post("/assistant/query", tags=["GenAI"])
async def assistant_query(body: AssistantQuery):
    """Intent-aware multilingual stadium assistant — resolves real answers from 12 intent categories."""
    intent = _detect_intent(body.message)
    lang = body.language if body.language in ["en", "es", "fr", "ar", "pt"] else "en"
    zone = body.zone or ""
    prefix = _ROLE_PREFIXES.get(body.role, "")

    if intent:
        responses = intent["responses"]
        reply_fn = responses.get(lang) or responses["en"]
        reply = prefix + reply_fn(zone)
        return {
            "intent": intent["name"],
            "reply": reply,
            "suggested_action": intent["suggested_action"],
            "language": lang,
            "escalated": intent["escalated"],
        }

    # Fallback for unrecognised intents
    fallback_fn = _FALLBACK.get(lang) or _FALLBACK["en"]
    return {
        "intent": body.intent_hint or "general",
        "reply": prefix + fallback_fn(body.message, zone, body.role),
        "suggested_action": "Visit Information Desk",
        "language": lang,
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
