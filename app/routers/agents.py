# app/routers/agents.py
from fastapi import APIRouter, Depends, Body, HTTPException
from pydantic import BaseModel
# import your existing auth dependency if you have one:
# from api.dependencies.auth import require_user  # <- example

# Agent SDK core (we’ll place it under api/founder/agents/*)
from api.founder.agents.registry import all_agents
from api.founder.agents.engine import run_agent
import api.founder.agents.core  # side-effect: registers Jade/Eve/Zeus/Hermes

router = APIRouter(prefix="/agents", tags=["agents"])

class SpeakIn(BaseModel):
    prompt: str
    # optional: node/companion scoping
    node_id: str | None = None
    companion_id: str | None = None

@router.get("")
def list_agents():
    return {"agents": all_agents()}

@router.post("/speak/{name}")
def speak(name: str, body: SpeakIn = Body(...)):
    # user = require_user()  # if you want to bind to your /auth token
    try:
        result = run_agent(name, body.prompt)
        # TODO: optionally write audit here using your existing /memory or /ledger hooks
        return result
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")

from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# ← Your SDK (logic lives here)
from app.agent_sdk import register as sdk_register
from app.agent_sdk import engine as sdk_engine
from app.agent_sdk import core as sdk_core

# If your core.py registers agents on import, keep this import.
# Otherwise ensure you call an init in startup (main.py)
try:
    _ = sdk_register  # noqa: F401
    _ = sdk_engine
    _ = sdk_core
except Exception:
    pass

router = APIRouter(prefix="/agents", tags=["agents"])

# ---------------- Schemas ----------------
class MessageIn(BaseModel):
    prompt: str
    node_id: Optional[str] = None
    companion_id: Optional[str] = None
    metadata: Dict[str, Any] = {}

class BroadcastIn(BaseModel):
    agents: List[str]
    prompt: str
    node_id: Optional[str] = None
    metadata: Dict[str, Any] = {}

# ---------------- Routes ----------------
@router.get("/ping")
def ping() -> Dict[str, Any]:
    try:
        agents = sdk_register.all_agents()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent registry issue: {e}")
    return {"status": "ok", "agents": agents}

@router.get("/list")
def list_agents() -> Dict[str, Any]:
    """Return agent names + short persona text."""
    names = sdk_register.all_agents()
    out = []
    for name in names:
        a = sdk_register.get(name)
        out.append({"name": a.name, "persona": getattr(a, "persona", "")})
    return {"count": len(out), "items": out}

@router.post("/spawn/{name}")
def spawn(name: str):
    """No-op for stateless agents; hook if you later add per-user state."""
    try:
        a = sdk_register.get(name)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")
    # If you implement per-user spawning later, do it here.
    return {"ok": True, "agent": a.name}

@router.post("/message/{name}")
def message(name: str, body: MessageIn = Body(...)):
    """Send a message to an agent; returns reply and any tool usage."""
    try:
        res = sdk_engine.run_agent(name, body.prompt)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent run failed: {e}")
    # Optionally: attach routing metadata for audit
    res["meta"] = {"node_id": body.node_id, "companion_id": body.companion_id, **(body.metadata or {})}
    return res

@router.post("/broadcast")
def broadcast(body: BroadcastIn = Body(...)):
    """Send one prompt to multiple agents and collect responses."""
    results = []
    for name in body.agents:
        try:
            reply = sdk_engine.run_agent(name, body.prompt)
            results.append({"agent": name, "ok": True, "reply": reply.get("reply"), "tool_used": reply.get("tool_used")})
        except Exception as e:
            results.append({"agent": name, "ok": False, "error": str(e)})
    return {"prompt": body.prompt, "results": results, "meta": {"node_id": body.node_id, **(body.metadata or {})}}

