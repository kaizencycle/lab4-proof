# app/routers/agents.py
from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# Import from your app.agent_sdk
from app.agent_sdk import get_agent, all_agents
from app.agent_sdk.register import get
from app.agent_sdk.engine import run_agent

# If you have a core.py that registers agents on import, uncomment this:
# import app.agent_sdk.core

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
        agents = all_agents()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent registry issue: {e}")
    return {"status": "ok", "agents": agents}

@router.get("/list")
def list_agents_route() -> Dict[str, Any]:
    """Return agent names + short persona text."""
    names = all_agents()
    out = []
    for name in names:
        try:
            a = get(name)
            out.append({"name": a.name, "persona": getattr(a, "persona", "")})
        except KeyError:
            continue
    return {"count": len(out), "items": out}

@router.post("/spawn/{name}")
def spawn(name: str):
    """No-op for stateless agents; hook if you later add per-user state."""
    try:
        a = get(name)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")
    return {"ok": True, "agent": a.name}

@router.post("/message/{name}")
def message(name: str, body: MessageIn = Body(...)):
    """Send a message to an agent; returns reply and any tool usage."""
    try:
        res = run_agent(name, body.prompt)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent run failed: {e}")
    # Optionally: attach routing metadata for audit
    res["meta"] = {
        "node_id": body.node_id, 
        "companion_id": body.companion_id, 
        **(body.metadata or {})
    }
    return res

@router.post("/broadcast")
def broadcast(body: BroadcastIn = Body(...)):
    """Send one prompt to multiple agents and collect responses."""
    results = []
    for name in body.agents:
        try:
            reply = run_agent(name, body.prompt)
            results.append({
                "agent": name, 
                "ok": True, 
                "reply": reply.get("reply"), 
                "tool_used": reply.get("tool_used")
            })
        except Exception as e:
            results.append({"agent": name, "ok": False, "error": str(e)})
    return {
        "prompt": body.prompt, 
        "results": results, 
        "meta": {"node_id": body.node_id, **(body.metadata or {})}
    }
