from typing import List, Dict, Callable, Any
from pydantic import BaseModel

class Tool(BaseModel):
    name: str
    fn: Callable[..., Any]
    description: str

class CoreAgent(BaseModel):
    name: str
    persona: str
    voice_id: str
    tools: List[Dict[str, Any]]

REGISTRY: Dict[str, CoreAgent] = {}

def register(agent: CoreAgent) -> None:
    REGISTRY[agent.name.lower()] = agent

def get(name: str) -> CoreAgent:
    key = name.lower()
    if key not in REGISTRY:
        raise KeyError(f"Agent '{name}' is not registered")
    return REGISTRY[key]

def all_agents() -> List[str]:
    return list(REGISTRY.keys())