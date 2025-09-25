# app/memory.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import List, Literal, Dict, Any
from app.auth import admin_required, AdminContext
import time

router = APIRouter(prefix="/memory", tags=["memory"])

# In-memory store (swap to SQLite/Postgres later)
# MEMORIES[app_id] = {"events": [ {type, content, ts}, ... ], "summary": str}
MEMORIES: Dict[str, Dict[str, Any]] = {}

# limits
MAX_EVENTS_PER_APP = 200          # rolling window
SUMMARIZE_AFTER_N = 10            # auto-summarize cadence

class MemoryEvent(BaseModel):
    type: Literal["reflection", "reply", "note", "system"] = "reflection"
    content: str

class MemoryAppendReq(BaseModel):
    events: List[MemoryEvent]

def _now_iso():
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")

def _get_bucket(app_id: str) -> Dict[str, Any]:
    b = MEMORIES.get(app_id)
    if not b:
        b = {"events": [], "summary": ""}
        MEMORIES[app_id] = b
    return b

@router.get("/")
def get_memory(ctx: AdminContext = Depends(admin_required)):
    b = _get_bucket(ctx.app_id)
    return {
        "ok": True,
        "summary": b.get("summary", ""),
        "events": b.get("events", []),
        "count": len(b.get("events", [])),
    }

@router.post("/append")
def append_memory(body: MemoryAppendReq, ctx: AdminContext = Depends(admin_required)):
    b = _get_bucket(ctx.app_id)
    for ev in body.events:
        b["events"].append({"type": ev.type, "content": ev.content, "ts": _now_iso()})
    # trim rolling window
    if len(b["events"]) > MAX_EVENTS_PER_APP:
        b["events"] = b["events"][-MAX_EVENTS_PER_APP:]
    return {"ok": True, "count": len(b["events"])}

# --- Optional: summarization via your LLM bridge (async) ---
from app.companions import llm_generate  # reuse your LLM helper

@router.post("/summarize")
async def summarize(ctx: AdminContext = Depends(admin_required)):
    b = _get_bucket(ctx.app_id)
    events = b.get("events", [])
    if not events:
        raise HTTPException(400, "No events to summarize.")
    # build a compact prompt with last 40 items
    tail = events[-40:]
    lines = [f"- ({e['type']}) {e['content']}" for e in tail]
    prompt = (
        "Summarize the user's journey so far in <120 words>, "
        "keeping it neutral, supportive, and useful for future coaching.\n"
        "Focus on recurring themes, values, goals, and concerns.\n\n"
        "Recent entries:\n" + "\n".join(lines)
    )
    summary = await llm_generate(prompt)
    b["summary"] = summary.strip()
    return {"ok": True, "summary": b["summary"]}
