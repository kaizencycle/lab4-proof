# app/companions.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from .auth import admin_required
import os
import httpx
from fastapi import HTTPException

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")  # "openai", "ollama", "deepseek"
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")

async def llm_generate(prompt: str) -> str:
    if LLM_PROVIDER == "openai":
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"}
        data = {
            "model": LLM_MODEL,
            "messages": [{"role": "system", "content": "You are a kind AI companion."},
                         {"role": "user", "content": prompt}],
        }
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(url, headers=headers, json=data)
            if resp.status_code != 200:
                raise HTTPException(status_code=500, detail=resp.text)
            return resp.json()["choices"][0]["message"]["content"].strip()

    elif LLM_PROVIDER == "ollama":
        url = "http://localhost:11434/api/generate"
        data = {"model": LLM_MODEL, "prompt": prompt}
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(url, json=data)
            if resp.status_code != 200:
                raise HTTPException(status_code=500, detail=resp.text)
            return resp.json().get("response", "").strip()

    elif LLM_PROVIDER == "deepseek":
        url = "https://api.deepseek.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {os.getenv('DEEPSEEK_API_KEY')}"}
        data = {
            "model": LLM_MODEL,
            "messages": [{"role": "system", "content": "You are a thoughtful AI companion."},
                         {"role": "user", "content": prompt}],
        }
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(url, headers=headers, json=data)
            if resp.status_code != 200:
                raise HTTPException(status_code=500, detail=resp.text)
            return resp.json()["choices"][0]["message"]["content"].strip()

    else:
        return "⚠️ No LLM provider configured."

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

