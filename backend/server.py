from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any
import uuid
import json
import re
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"wizard-{uuid.uuid4()}",
            system_message="You are a precise strategist that outputs only valid JSON.",
        ).with_model("anthropic", "claude-sonnet-4-6")

        reply = await chat.send_message(UserMessage(text=prompt))
        text = reply if isinstance(reply, str) else str(reply)

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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()