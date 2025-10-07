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
