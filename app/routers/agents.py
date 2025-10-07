# app/routers/agents.py
from fastapi import APIRouter, Body, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging

# Import from your app.agent_sdk
from app.agent_sdk import get_agent, all_agents
from app.agent_sdk.register import get
from app.agent_sdk.engine import run_agent

import app.agent_sdk.core  # This triggers agent registration on startup

router = APIRouter(prefix="/agents", tags=["agents"])
logger = logging.getLogger("agents")

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
    """Health check endpoint"""
    try:
        agents = all_agents()
        logger.info(f"Ping successful. Agents: {agents}")
        return {"status": "ok", "agents": agents}
    except Exception as e:
        logger.error(f"Ping failed: {e}")
        raise HTTPException(status_code=500, detail=f"Agent registry issue: {e}")

@router.get("/list")
def list_agents_route() -> Dict[str, Any]:
    """Return agent names + short persona text."""
    try:
        names = all_agents()
        out = []
        for name in names:
            try:
                a = get(name)
                out.append({"name": a.name, "persona": getattr(a, "persona", "")})
            except KeyError:
                continue
        logger.info(f"Listed {len(out)} agents")
        return {"count": len(out), "items": out}
    except Exception as e:
        logger.error(f"List agents failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/spawn/{name}")
def spawn(name: str):
    """No-op for stateless agents; hook if you later add per-user state."""
    try:
        a = get(name)
        logger.info(f"Agent {name} spawned")
        return {"ok": True, "agent": a.name}
    except KeyError:
        logger.error(f"Agent {name} not found")
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")

@router.post("/message/{name}")
async def message(name: str, body: MessageIn = Body(...)):
    """Send a message to an agent; returns reply and any tool usage."""
    logger.info(f"Message to {name}: {body.prompt[:50]}...")
    
    try:
        # Check if agent exists first
        agent = get(name)
        logger.info(f"Found agent: {agent.name}")
        
        # Run the agent
        res = run_agent(name, body.prompt)
        logger.info(f"Agent {name} responded: {str(res)[:100]}...")
        
        # Ensure we have a valid response structure
        if not isinstance(res, dict):
            res = {"reply": str(res), "agent": name}
        
        # Add metadata
        res["meta"] = {
            "node_id": body.node_id, 
            "companion_id": body.companion_id, 
            **(body.metadata or {})
        }
        
        # Explicitly return JSONResponse to ensure proper formatting
        return JSONResponse(content=res, status_code=200)
        
    except KeyError:
        logger.error(f"Agent '{name}' not found in registry")
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")
    except Exception as e:
        logger.error(f"Agent run failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Agent run failed: {str(e)}")

@router.post("/broadcast")
def broadcast(body: BroadcastIn = Body(...)):
    """Send one prompt to multiple agents and collect responses."""
    logger.info(f"Broadcasting to {len(body.agents)} agents")
    results = []
    
    for name in body.agents:
        try:
            reply = run_agent(name, body.prompt)
            results.append({
                "agent": name, 
                "ok": True, 
                "reply": reply.get("reply") if isinstance(reply, dict) else str(reply),
                "tool_used": reply.get("tool_used") if isinstance(reply, dict) else None
            })
        except Exception as e:
            logger.error(f"Broadcast to {name} failed: {e}")
            results.append({"agent": name, "ok": False, "error": str(e)})
    
    return JSONResponse(content={
        "prompt": body.prompt, 
        "results": results, 
        "meta": {"node_id": body.node_id, **(body.metadata or {})}
    }, status_code=200)
