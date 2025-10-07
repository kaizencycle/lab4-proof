from fastapi import APIRouter
from app.agent_sdk import register, core

router = APIRouter(prefix="/agents", tags=["agents"])

@router.get("/ping")
def ping_agents():
    return {"status": "ok", "agents": register.list_agents()}

@router.post("/spawn/{agent_name}")
def spawn_agent(agent_name: str):
    instance = core.spawn(agent_name)
    return {"ok": True, "agent": instance.to_dict()}
