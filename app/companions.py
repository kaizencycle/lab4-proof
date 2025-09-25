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
