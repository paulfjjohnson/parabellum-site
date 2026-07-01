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
    ip = request.client.host if request.client else "unknown"
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


@api_router.post("/contact")
async def submit_contact(req: ContactSubmission):
    sub_id = await _save_submission("contact", req.model_dump())
    return {"ok": True, "id": sub_id}


@api_router.post("/launch")
async def submit_launch(req: LaunchSubmission):
    sub_id = await _save_submission("launch", req.model_dump())
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