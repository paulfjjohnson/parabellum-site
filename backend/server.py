from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Dict, Any, Optional
import uuid
import json
import re
import bcrypt
import jwt
import asyncio
import smtplib
from email.message import EmailMessage
from datetime import datetime, timezone, timedelta

# Optional Emergent library (only present on the Emergent platform).
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    HAS_EMERGENT = True
except Exception:
    HAS_EMERGENT = False


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# LLM config — prefer a direct Anthropic key when present (portable to any host),
# otherwise fall back to the Emergent universal key while running on Emergent.
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
ANTHROPIC_MODEL = os.environ.get('ANTHROPIC_MODEL', 'claude-sonnet-4-6-20260218')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Auth config
JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret-change-me')
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Email (SMTP) config — set these on your host to enable lead notifications.
SMTP_HOST = os.environ.get('SMTP_HOST')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD')
SMTP_FROM = os.environ.get('SMTP_FROM', SMTP_USER or 'no-reply@theparabellumco.com')
SMTP_STARTTLS = os.environ.get('SMTP_STARTTLS', 'true').lower() == 'true'
LEAD_NOTIFY_EMAIL = os.environ.get('LEAD_NOTIFY_EMAIL', 'paul@theparabellumco.com')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# ==================== AUTH ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email, "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"email": payload.get("email")})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {"email": user["email"], "name": user.get("name"), "role": user.get("role")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@api_router.post("/auth/login")
async def login(req: LoginRequest, request: Request):
    email = req.email.lower().strip()
    xff = request.headers.get("x-forwarded-for", "")
    ip = xff.split(",")[0].strip() if xff else (request.client.host if request.client else "unknown")
    identifier = f"{ip}:{email}"

    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.now(timezone.utc) < datetime.fromisoformat(locked_until):
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in a few minutes.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        new_count = (attempt.get("count", 0) + 1) if attempt else 1
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$set": {"identifier": identifier, "count": new_count,
                      "locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(str(user["_id"]), user["email"])
    return {"access_token": token, "user": {"email": user["email"], "name": user.get("name"), "role": user.get("role")}}


@api_router.get("/auth/me")
async def me(current=Depends(get_current_user)):
    return current


# ==================== SUBMISSIONS ====================

class ContactSubmission(BaseModel):
    name: str
    email: EmailStr
    org: Optional[str] = ""
    message: str


class LaunchSubmission(BaseModel):
    name: str
    email: EmailStr
    org: Optional[str] = ""
    orgType: Optional[str] = ""
    goals: List[str] = []
    timeline: Optional[str] = ""
    notes: Optional[str] = ""


async def _save_submission(kind: str, data: dict) -> str:
    sub_id = str(uuid.uuid4())
    doc = {
        "id": sub_id, "type": kind, "data": data,
        "name": data.get("name"), "email": data.get("email"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.submissions.insert_one(doc)
    return sub_id


def _send_email_sync(subject: str, body: str):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = LEAD_NOTIFY_EMAIL
    msg.set_content(body)
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
        if SMTP_STARTTLS:
            server.starttls()
        if SMTP_USER and SMTP_PASSWORD:
            server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)


async def _notify_lead(kind: str, data: dict):
    """Fire-and-forget lead notification. No-ops (logs) if SMTP is not configured."""
    if not SMTP_HOST:
        logger.info(f"[lead:{kind}] SMTP not configured — skipping email. From {data.get('email')}")
        return
    label = "Launch Request" if kind == "launch" else "Contact"
    lines = [f"New {label} from the Parabellum site.", ""]
    for k, v in data.items():
        if v in (None, "", []):
            continue
        val = ", ".join(v) if isinstance(v, list) else str(v)
        lines.append(f"{k}: {val}")
    lines += ["", "— View all leads in the admin dashboard: /admin"]
    body = "\n".join(lines)
    subject = f"[Parabellum] New {label}: {data.get('name') or data.get('email') or 'Unknown'}"
    try:
        await asyncio.to_thread(_send_email_sync, subject, body)
        logger.info(f"[lead:{kind}] notification email sent to {LEAD_NOTIFY_EMAIL}")
    except Exception as e:
        logger.error(f"[lead:{kind}] email send failed: {e}")


@api_router.post("/contact")
async def submit_contact(req: ContactSubmission):
    data = req.model_dump()
    sub_id = await _save_submission("contact", data)
    asyncio.create_task(_notify_lead("contact", data))
    return {"ok": True, "id": sub_id}


@api_router.post("/launch")
async def submit_launch(req: LaunchSubmission):
    data = req.model_dump()
    sub_id = await _save_submission("launch", data)
    asyncio.create_task(_notify_lead("launch", data))
    return {"ok": True, "id": sub_id}


@api_router.get("/admin/submissions")
async def list_submissions(current=Depends(get_current_user)):
    docs = await db.submissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"submissions": docs}


class WizardRequest(BaseModel):
    answers: Dict[str, Any]


def _fmt_answers(a: Dict[str, Any]) -> str:
    lines = []
    for k, v in a.items():
        if v is None or v == "" or v == []:
            continue
        val = ", ".join(v) if isinstance(v, list) else str(v)
        lines.append(f"- {k}: {val}")
    return "\n".join(lines) if lines else "- (no answers provided)"


SYSTEM_MSG = "You are a precise strategist that outputs only valid JSON."


async def _call_llm(prompt: str) -> str:
    """Portable LLM call. Uses a direct Anthropic key when available,
    otherwise falls back to the Emergent universal key on-platform."""
    if ANTHROPIC_API_KEY:
        from anthropic import AsyncAnthropic
        client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
        msg = await client.messages.create(
            model=ANTHROPIC_MODEL,
            max_tokens=2000,
            system=SYSTEM_MSG,
            messages=[{"role": "user", "content": prompt}],
        )
        return "".join(getattr(b, "text", "") for b in msg.content)
    if HAS_EMERGENT and EMERGENT_LLM_KEY:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"wizard-{uuid.uuid4()}",
            system_message=SYSTEM_MSG,
        ).with_model("anthropic", "claude-sonnet-4-6")
        reply = await chat.send_message(UserMessage(text=prompt))
        return reply if isinstance(reply, str) else str(reply)
    raise RuntimeError("No LLM key configured (set ANTHROPIC_API_KEY or EMERGENT_LLM_KEY)")


@api_router.post("/wizard/strategy")
async def wizard_strategy(req: WizardRequest):
    org = req.answers.get("orgName") or "the organization"
    prompt = (
        "You are a senior merch-tech platform strategist at The Parabellum Company. "
        "Using the intake answers below, produce a Platform Strategy Document for a team/merchandise store. "
        "The recommended stack is WordPress + WooCommerce on the Flatsome framework, with n8n/Zapier automations. "
        "Return ONLY valid JSON: an array of objects, each {\"h\": section title, \"b\": section body}. "
        "No markdown, no prose outside the JSON. Include exactly these sections in order: "
        "Executive Summary, Platform Architecture, Store Configuration, Product Catalog Architecture, "
        "Design & Brand Brief, Integrations Map, Automation Workflows, Recommended Plugins, "
        "Timeline & Milestones, Investment Estimate, Next Steps. "
        "Each body should be 2-4 sentences, specific to the answers, confident and tactical in tone. "
        "For Recommended Plugins, list 8-12 specific plugin names. For Next Steps, give 5 numbered actions.\n\n"
        f"INTAKE ANSWERS for {org}:\n{_fmt_answers(req.answers)}"
    )

    try:
        text = await _call_llm(prompt)

        # Strip code fences if present
        text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
        match = re.search(r"\[.*\]", text, re.DOTALL)
        if match:
            text = match.group(0)
        sections = json.loads(text)
        if not isinstance(sections, list):
            raise ValueError("unexpected format")
        return {"sections": sections}
    except Exception as e:
        logger.error(f"wizard_strategy failed: {e}")
        raise HTTPException(status_code=502, detail="strategy_generation_failed")


# ==================== PACKAGE BUILDER ====================
# EDIT PRICES HERE — single source of truth. Each tier has flat + revenue-share pricing.
TIERS = {
    "ignition": {
        "name": "Ignition", "popular": False, "custom": False, "from": False,
        "best_for": "First-time drop runners, solo creators, single teams.",
        "contract": "Month-to-month",
        "flat": {"setup": 1200.0, "monthly": 197.0},
        "revshare": {"setup": 500.0, "monthly": 0.0, "pct": 12, "min": 75.0},
        "includes": ["1 branded storefront (WooCommerce + Flatsome)", "Up to 2 drop windows / month",
                     "Team Store Wizard — 5 AI strategy docs/mo", "Countdown timer + email capture templates",
                     "Guest checkout & standard payments", "Email support (48-hr)", "Hosting, security & uptime monitoring"],
        "not_included": ["Gang Sheet Builder", "Configurator", "Custom automation", "Fundraising-split reporting"],
    },
    "operator": {
        "name": "Operator", "popular": True, "custom": False, "from": False,
        "best_for": "Schools, booster clubs & growing brands running recurring drops.",
        "contract": "6-month minimum",
        "flat": {"setup": 2800.0, "monthly": 597.0},
        "revshare": {"setup": 1500.0, "monthly": 297.0, "pct": 7, "min": 200.0},
        "includes": ["Everything in Ignition", "Unlimited drop windows", "Team Store Wizard — unlimited AI",
                     "Gang Sheet Builder (Professional)", "Automation workflows (n8n)",
                     "Fundraising split reporting dashboard", "Access-code private team stores",
                     "Priority support (24-hr) + monthly report", "Quarterly strategy call"],
        "not_included": ["Product Configurator", "Multi-site / multi-tenant", "Custom feature development"],
    },
    "command": {
        "name": "Command", "popular": False, "custom": True, "from": True,
        "best_for": "Districts, agencies & multi-site operators.",
        "contract": "12-month minimum",
        "flat": {"setup": 5500.0, "monthly": 1497.0},
        "revshare": {"setup": 3500.0, "monthly": 897.0, "pct": 4, "min": 500.0},
        "includes": ["Everything in Operator", "Up to 3 storefronts (multi-tenant)", "Product Configurator",
                     "Custom AI workflow builds", "Advanced analytics dashboard", "Dedicated account manager",
                     "White-label option", "Monthly strategy session + same-day support"],
        "not_included": [],
    },
}
ADDONS = {
    "extra_site": {"label": "Additional storefront / site", "setup": 0.0, "monthly": 200.0, "quote": False, "note": "per site"},
    "rush_drop": {"label": "Rush drop turnaround (<5 days)", "setup": 250.0, "monthly": 0.0, "quote": False, "note": "flat per drop"},
    "ai_credits": {"label": "Extra AI credits (+10 docs)", "setup": 0.0, "monthly": 49.0, "quote": False, "note": "Ignition"},
    "consulting": {"label": "Strategic consulting session", "setup": 350.0, "monthly": 0.0, "quote": False, "note": "per session"},
    "custom_dev": {"label": "Custom feature development", "setup": 0.0, "monthly": 0.0, "quote": True, "note": "quoted per project"},
    "reseller_license": {"label": "Gang Sheet reseller license (white-label)", "setup": 0.0, "monthly": 0.0, "quote": True, "note": "agency pricing"},
}


def _price_selection(tier: str, addons: List[str], mode: str = "flat"):
    if tier not in TIERS:
        raise HTTPException(status_code=400, detail="Invalid tier")
    if mode not in ("flat", "revshare"):
        mode = "flat"
    base = TIERS[tier][mode]
    setup = base["setup"]
    monthly = base["monthly"]
    valid_addons = []
    has_quote_addon = False
    for a in addons or []:
        if a in ADDONS:
            ad = ADDONS[a]
            if ad.get("quote"):
                has_quote_addon = True
            else:
                setup += ad["setup"]
                monthly += ad["monthly"]
            valid_addons.append(a)
    # Command (custom scope) or any quote-only add-on cannot be bought online — quote only.
    buyable = (not TIERS[tier]["custom"]) and (not has_quote_addon)
    revshare = TIERS[tier]["revshare"] if mode == "revshare" else None
    return round(setup, 2), round(monthly, 2), valid_addons, buyable, revshare


@api_router.get("/packages")
async def get_packages():
    return {"tiers": TIERS, "addons": ADDONS,
            "paypal_enabled": bool(os.environ.get("PAYPAL_CLIENT_ID")),
            "paypal_client_id": os.environ.get("PAYPAL_CLIENT_ID", "")}


class QuoteRequest(BaseModel):
    name: str
    email: EmailStr
    org: Optional[str] = ""
    tier: str
    addons: List[str] = []
    mode: str = "flat"
    question: Optional[str] = ""


@api_router.post("/packages/quote")
async def package_quote(req: QuoteRequest):
    setup, monthly, addons, buyable, revshare = _price_selection(req.tier, req.addons, req.mode)
    data = {
        "name": req.name, "email": req.email, "org": req.org,
        "tier": TIERS[req.tier]["name"], "mode": req.mode,
        "addons": [ADDONS[a]["label"] for a in addons],
        "setup_total": setup, "monthly_total": monthly,
        "revshare": f"{revshare['pct']}% (min ${revshare['min']:.0f}/mo)" if revshare else None,
        "question": req.question,
    }
    sub_id = await _save_submission("package_quote", data)
    asyncio.create_task(_notify_lead("package_quote", data))
    return {"ok": True, "id": sub_id, "setup_total": setup, "monthly_total": monthly}


# ---- PayPal (setup fee checkout) ----
PAYPAL_CLIENT_ID = os.environ.get("PAYPAL_CLIENT_ID")
PAYPAL_SECRET = os.environ.get("PAYPAL_SECRET")
PAYPAL_BASE = os.environ.get("PAYPAL_BASE", "https://api-m.sandbox.paypal.com")


async def _paypal_token():
    import httpx
    async with httpx.AsyncClient() as c:
        r = await c.post(f"{PAYPAL_BASE}/v1/oauth2/token",
                         auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET),
                         data={"grant_type": "client_credentials"})
        r.raise_for_status()
        return r.json()["access_token"]


class PaypalOrderRequest(BaseModel):
    tier: str
    addons: List[str] = []
    mode: str = "flat"
    email: Optional[EmailStr] = None


@api_router.post("/packages/paypal/order")
async def paypal_create_order(req: PaypalOrderRequest):
    if not PAYPAL_CLIENT_ID or not PAYPAL_SECRET:
        raise HTTPException(status_code=503, detail="PayPal not configured")
    setup, monthly, addons, buyable, revshare = _price_selection(req.tier, req.addons, req.mode)
    if not buyable:
        raise HTTPException(status_code=400, detail="This configuration is quote-only. Please request a quote.")
    import httpx
    token = await _paypal_token()
    async with httpx.AsyncClient() as c:
        r = await c.post(f"{PAYPAL_BASE}/v2/checkout/orders",
                         headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                         json={
                             "intent": "CAPTURE",
                             "purchase_units": [{
                                 "reference_id": req.tier,
                                 "description": f"Parabellum {TIERS[req.tier]['name']} setup fee",
                                 "amount": {"currency_code": "USD", "value": f"{setup:.2f}"},
                             }],
                         })
        r.raise_for_status()
        order = r.json()
    await db.payment_transactions.insert_one({
        "provider": "paypal", "order_id": order["id"], "amount": setup, "currency": "usd",
        "tier": req.tier, "mode": req.mode, "addons": addons, "monthly_total": monthly, "email": req.email or "",
        "payment_status": "created", "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"order_id": order["id"]}


@api_router.post("/packages/paypal/capture/{order_id}")
async def paypal_capture_order(order_id: str):
    if not PAYPAL_CLIENT_ID or not PAYPAL_SECRET:
        raise HTTPException(status_code=503, detail="PayPal not configured")
    import httpx
    token = await _paypal_token()
    async with httpx.AsyncClient() as c:
        r = await c.post(f"{PAYPAL_BASE}/v2/checkout/orders/{order_id}/capture",
                         headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
        r.raise_for_status()
        result = r.json()
    status = result.get("status")
    txn = await db.payment_transactions.find_one({"order_id": order_id})
    if txn and txn.get("payment_status") != "COMPLETED" and status == "COMPLETED":
        await db.payment_transactions.update_one(
            {"order_id": order_id},
            {"$set": {"payment_status": "COMPLETED", "paid_at": datetime.now(timezone.utc).isoformat()}},
        )
        data = {
            "email": txn.get("email"), "tier": TIERS.get(txn.get("tier"), {}).get("name", txn.get("tier")),
            "addons": [ADDONS[a]["label"] for a in txn.get("addons", []) if a in ADDONS],
            "setup_paid": txn.get("amount"), "monthly_total": txn.get("monthly_total"),
        }
        await _save_submission("package_order", data)
        asyncio.create_task(_notify_lead("package_order", data))
    return {"status": status}

# ==================== TENANT PROVISIONING (Phase 1 cockpit) ====================
# Intake + record-keeping + `wp tsa setup` command generation for standing up a
# new print-shop tenant. Mirrors docs/70-packaging-a-new-customer.md. The admin
# is the cockpit here — it captures the answers and generates the command; the
# actual clone still runs on the WordPress side (Phase 2 automates firing it).

STORE_TYPES = ["School", "Team", "Business"]
PROVISION_TIERS = ["Starter", "Pro", "Studio"]
TENANT_STATUSES = ["draft", "provisioning", "live", "failed"]

# Post-launch checklist (mirrors docs/70-packaging-a-new-customer.md §4)
CHECKLIST_STEPS = [
    "setup_ran",      # wp tsa setup executed (seed + provision + business profile)
    "branding",       # logo + colors applied (Platform → Branding)
    "domain",         # customer domain pointed + SSL
    "email_smtp",     # SMTP / deliverability configured
    "form_routing",   # TSA Form Emails routing set
    "woocommerce",    # payment gateway, tax, shipping, store address
    "verified",       # pages verified (Home, Quote, Configurator, Contact, footer)
    "cache_purged",   # LiteSpeed Cache → Purge All
]


class TenantCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    # Identity
    name: str
    slug: Optional[str] = ""
    store_type: str = "School"
    tier: str = "Starter"
    # First-store branding
    mascot: Optional[str] = ""
    primary_color: Optional[str] = ""
    secondary_color: Optional[str] = ""
    tagline: Optional[str] = ""
    spotlight: Optional[str] = ""
    store_status: Optional[str] = ""
    # Business profile
    legal_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    service_area: Optional[str] = ""
    hours: Optional[str] = ""
    # Socials + branding extras
    instagram: Optional[str] = ""
    facebook: Optional[str] = ""
    tiktok: Optional[str] = ""
    website: Optional[str] = ""
    logo_note: Optional[str] = ""
    logo_data: Optional[str] = ""  # data URL (base64) of the uploaded logo, downscaled client-side
    white_label_credit: Optional[str] = ""
    notes: Optional[str] = ""


class TenantUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    status: Optional[str] = None
    checklist: Optional[Dict[str, bool]] = None
    notes: Optional[str] = None


def _slugify(value: str) -> str:
    value = (value or "").strip().lower()
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def _sh_quote(value: Any) -> str:
    """Double-quote a value for a copy-paste-safe shell command."""
    v = str(value).replace("\\", "\\\\").replace('"', '\\"')
    return f'"{v}"'


def build_tsa_command(t: dict) -> str:
    """Build the `wp tsa setup` command from a tenant record.
    Only includes flags that have a value. See docs/70-packaging-a-new-customer.md."""
    flags = []

    def add(flag: str, value: Any):
        if value not in (None, "", []):
            flags.append(f"--{flag}={_sh_quote(value)}")

    add("name", t.get("name"))
    add("slug", t.get("slug"))
    add("tier", (t.get("tier") or "").lower())
    add("primary", t.get("primary_color"))
    add("secondary", t.get("secondary_color"))
    add("email", t.get("email"))
    add("tagline", t.get("tagline"))
    add("phone", t.get("phone"))
    add("city", t.get("city"))
    add("state", t.get("state"))
    add("service-area", t.get("service_area"))
    add("hours", t.get("hours"))
    add("instagram", t.get("instagram"))
    return "wp tsa setup \\\n  " + " \\\n  ".join(flags)


@api_router.post("/admin/tenants")
async def create_tenant(req: TenantCreate, current=Depends(get_current_user)):
    data = req.model_dump()
    data["slug"] = _slugify(data.get("slug") or data.get("name"))
    if not data["slug"]:
        raise HTTPException(status_code=400, detail="A business name or slug is required.")
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        **data,
        "id": str(uuid.uuid4()),
        "status": "draft",
        "checklist": {k: False for k in CHECKLIST_STEPS},
        "created_at": now,
        "updated_at": now,
    }
    doc["command"] = build_tsa_command(doc)
    await db.tenants.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/admin/tenants")
async def list_tenants(current=Depends(get_current_user)):
    docs = await db.tenants.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"tenants": docs}


@api_router.get("/admin/tenants/{tenant_id}")
async def get_tenant(tenant_id: str, current=Depends(get_current_user)):
    doc = await db.tenants.find_one({"id": tenant_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return doc


@api_router.patch("/admin/tenants/{tenant_id}")
async def update_tenant(tenant_id: str, req: TenantUpdate, current=Depends(get_current_user)):
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if "status" in updates and updates["status"] not in TENANT_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status.")
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update.")
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.tenants.update_one({"id": tenant_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return await db.tenants.find_one({"id": tenant_id}, {"_id": 0})


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_seed():
    # Indexes
    try:
        await db.users.create_index("email", unique=True)
        await db.login_attempts.create_index("identifier")
        await db.submissions.create_index("created_at")
        await db.tenants.create_index("created_at")
    except Exception as e:
        logger.warning(f"index creation: {e}")
    # Seed / update admin
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if existing is None:
        await db.users.insert_one({
            "email": ADMIN_EMAIL.lower(), "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin", "role": "admin", "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one({"email": ADMIN_EMAIL.lower()},
                                  {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})
        logger.info("Updated admin password")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()