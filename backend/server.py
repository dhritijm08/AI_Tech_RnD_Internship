from fastapi import FastAPI, APIRouter, HTTPException, Header, Response, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional, Dict, List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class UserCreate(BaseModel):
    name: str
    day: str
    month: Optional[str] = ""
    year: Optional[str] = ""
    email: str
    phone: Optional[str] = ""
    company: Optional[str] = ""
    designation: Optional[str] = ""


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    day: str
    month: str = ""
    year: str = ""
    email: str
    phone: str = ""
    company: str = ""
    designation: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class GameScores(BaseModel):
    pattern_recall: int = 0
    rule_changed: int = 0
    reaction_pulse: int = 0
    decision_sprint: int = 0
    tap_stars: int = 0
    find_odd: int = 0


class SessionCreate(BaseModel):
    user_id: str
    scores: GameScores


class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str = ""
    user_email: str = ""
    scores: Dict[str, int]
    total_score: int
    level: str
    dimensions: Dict[str, int]
    email_sent: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class LeaderboardEntry(BaseModel):
    name: str
    score: int


# ---------- Helpers ----------
def compute_results(scores: GameScores):
    raw = scores.model_dump()
    norm = {k: max(0, min(100, int(round(v * 100 / 50)))) for k, v in raw.items()}
    total = int(round(sum(norm.values()) / 6))
    level = "BEGINNER"
    if total >= 80:
        level = "ADVANCED"
    elif total >= 60:
        level = "PROFICIENT"
    elif total >= 40:
        level = "INTERMEDIATE"
    dimensions = {
        "attention": int(round((norm["reaction_pulse"] + norm["tap_stars"]) / 2)),
        "processing": int(round((norm["decision_sprint"] + norm["reaction_pulse"]) / 2)),
        "memory": int(round((norm["pattern_recall"] + norm["find_odd"]) / 2)),
        "flexibility": int(round((norm["rule_changed"] + norm["decision_sprint"]) / 2)),
    }
    return total, level, dimensions, norm


def short_name(full: str) -> str:
    parts = (full or "").strip().split()
    if not parts:
        return "Player"
    if len(parts) == 1:
        return parts[0].upper()
    return f"{parts[0][:1].upper()}. {' '.join(parts[1:]).upper()}"


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Echoes of Silence — Cognitive Assessment API"}


@api_router.post("/users", response_model=User)
async def create_user(payload: UserCreate):
    user = User(**payload.model_dump())
    await db.users.insert_one(user.model_dump())
    return user


@api_router.post("/sessions", response_model=Session)
async def create_session(payload: SessionCreate):
    user = await db.users.find_one({"id": payload.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    total, level, dimensions, norm_scores = compute_results(payload.scores)
    session = Session(
        user_id=payload.user_id,
        user_name=user.get("name", ""),
        user_email=user.get("email", ""),
        scores=norm_scores,
        total_score=total,
        level=level,
        dimensions=dimensions,
    )
    await db.sessions.insert_one(session.model_dump())
    return session


@api_router.get("/sessions/{session_id}", response_model=Session)
async def get_session(session_id: str):
    doc = await db.sessions.find_one({"id": session_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")
    return Session(**doc)


@api_router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def leaderboard(limit: int = 10):
    cursor = db.sessions.find({}, {"_id": 0, "user_name": 1, "total_score": 1}).sort("total_score", -1).limit(limit)
    rows = []
    async for doc in cursor:
        rows.append(LeaderboardEntry(name=short_name(doc.get("user_name", "")), score=int(doc.get("total_score", 0))))
    return rows


@api_router.get("/admin/stats")
async def admin_stats(x_admin_token: str = Header(default="")):
    if not ADMIN_TOKEN or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    users = await db.users.count_documents({})
    sessions = await db.sessions.count_documents({})
    pipeline = [{"$group": {"_id": None, "avg": {"$avg": "$total_score"}}}]
    avg = 0
    async for row in db.sessions.aggregate(pipeline):
        avg = int(round(row.get("avg") or 0))
    return {"users": users, "sessions": sessions, "avg_score": avg}


@api_router.get("/admin/export.csv")
async def admin_export_csv(
    x_admin_token: str = Header(default=""),
    from_: Optional[str] = Query(default=None, alias="from"),
    to: Optional[str] = None,
):
    """Admin-only: export all participants + scores as a CSV file. Optional from/to dates (YYYY-MM-DD)."""
    if not ADMIN_TOKEN or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

    import csv
    import io as _io
    buf = _io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "session_id", "created_at", "name", "email", "phone", "company", "designation",
        "total_score", "level",
        "attention", "processing", "memory", "flexibility",
        "pattern_recall", "rule_changed", "reaction_pulse",
        "decision_sprint", "tap_stars", "find_odd",
        "email_sent",
    ])

    query = {}
    if from_ or to:
        rng = {}
        if from_:
            rng["$gte"] = from_  # ISO strings sort correctly lexicographically
        if to:
            rng["$lte"] = to + "T23:59:59"
        query["created_at"] = rng

    cursor = db.sessions.find(query, {"_id": 0}).sort("created_at", -1)
    async for s in cursor:
        u = await db.users.find_one({"id": s.get("user_id")}, {"_id": 0}) or {}
        sc = s.get("scores", {})
        d = s.get("dimensions", {})
        writer.writerow([
            s.get("id", ""), s.get("created_at", ""),
            u.get("name", s.get("user_name", "")),
            u.get("email", s.get("user_email", "")),
            u.get("phone", ""), u.get("company", ""), u.get("designation", ""),
            s.get("total_score", 0), s.get("level", ""),
            d.get("attention", 0), d.get("processing", 0), d.get("memory", 0), d.get("flexibility", 0),
            sc.get("pattern_recall", 0), sc.get("rule_changed", 0), sc.get("reaction_pulse", 0),
            sc.get("decision_sprint", 0), sc.get("tap_stars", 0), sc.get("find_odd", 0),
            "yes" if s.get("email_sent") else "no",
        ])

    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="echoes-leads.csv"'},
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
