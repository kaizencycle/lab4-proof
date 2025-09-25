# app/companions.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from .auth import admin_required

router = APIRouter(prefix="/companions", tags=["companions"])

class CompanionCreate(BaseModel):
    name: str
    archetype: str   # e.g. "sage", "scout", "healer"
    traits: list[str] = []

COMPANIONS = {}

@router.post("/")
def create_companion(body: CompanionCreate, ctx=Depends(admin_required)):
    COMPANIONS[ctx.app_id] = body.dict()
    return {"ok": True, "companion": COMPANIONS[ctx.app_id]}

@router.get("/")
def get_companion(ctx=Depends(admin_required)):
    return COMPANIONS.get(ctx.app_id, None)

@router.post("/respond")
def companion_respond(ctx=Depends(admin_required)):
    comp = COMPANIONS.get(ctx.app_id)
    if not comp:
        return {"ok": False, "response": "You don’t have a companion yet."}

    # simple flavor text (replace with LLM call later)
    name = comp["name"]
    archetype = comp["archetype"]

    replies = {
        "scout": f"{name} scouts ahead and whispers: 'Keep moving, every step matters.'",
        "sage": f"{name} reflects wisely: 'Your thoughts carry echoes of growth.'",
        "healer": f"{name} soothes: 'Scars remind us we also heal.'",
        "guardian": f"{name} assures: 'I stand with you, always.'"
    }

    return {"ok": True, "response": replies.get(archetype, f"{name} nods quietly.")}

