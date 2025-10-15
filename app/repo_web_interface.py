# app/repo_web_interface.py
"""
Simple web interface for managing repositories and agents.
"""

from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from typing import Optional, List
import os

from .repo_memory import repo_memory
from .repo_agent_engine import repo_agent_engine
from .repo_models import RepoStatus, AgentType

router = APIRouter(prefix="/web", tags=["web-interface"])

# Templates directory
templates = Jinja2Templates(directory="templates")

@router.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard"""
    stats = repo_memory.get_stats()
    recent_repos = repo_memory.list_repositories()[:5]
    recent_agents = repo_memory.list_agents()[:5]
    
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "stats": stats,
        "recent_repos": recent_repos,
        "recent_agents": recent_agents
    })

@router.get("/repos", response_class=HTMLResponse)
async def repos_list(request: Request, status: Optional[str] = None):
    """List repositories"""
    repos = repo_memory.list_repositories()
    if status:
        try:
            status_enum = RepoStatus(status)
            repos = [repo for repo in repos if repo.status == status_enum]
        except ValueError:
            pass
    
    return templates.TemplateResponse("repos.html", {
        "request": request,
        "repos": repos,
        "current_status": status
    })

@router.get("/repos/add", response_class=HTMLResponse)
async def add_repo_form(request: Request):
    """Add repository form"""
    return templates.TemplateResponse("add_repo.html", {
        "request": request
    })

@router.post("/repos/add")
async def add_repo_submit(
    request: Request,
    name: str = Form(...),
    full_name: str = Form(...),
    description: Optional[str] = Form(None),
    url: str = Form(...),
    clone_url: str = Form(...),
    language: Optional[str] = Form(None),
    topics: Optional[str] = Form(None)
):
    """Submit new repository"""
    try:
        repo_data = {
            "name": name,
            "full_name": full_name,
            "description": description,
            "url": url,
            "clone_url": clone_url,
            "language": language,
            "topics": topics.split(",") if topics else []
        }
        
        repo = repo_memory.create_repository(repo_data)
        return RedirectResponse(url=f"/web/repos/{repo.id}", status_code=303)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/repos/{repo_id}", response_class=HTMLResponse)
async def repo_detail(request: Request, repo_id: str):
    """Repository detail page"""
    repo_data = repo_memory.get_repo_with_agents(repo_id)
    if not repo_data:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    return templates.TemplateResponse("repo_detail.html", {
        "request": request,
        "repo": repo_data["repository"],
        "agents": repo_data["agents"]
    })

@router.get("/repos/{repo_id}/agents/add", response_class=HTMLResponse)
async def add_agent_form(request: Request, repo_id: str):
    """Add agent form"""
    repo = repo_memory.get_repository(repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    return templates.TemplateResponse("add_agent.html", {
        "request": request,
        "repo": repo,
        "agent_types": [t.value for t in AgentType]
    })

@router.post("/repos/{repo_id}/agents/add")
async def add_agent_submit(
    request: Request,
    repo_id: str,
    name: str = Form(...),
    agent_type: str = Form(...),
    persona: str = Form(...),
    system_prompt: str = Form(...)
):
    """Submit new agent"""
    try:
        agent_data = {
            "repo_id": repo_id,
            "name": name,
            "agent_type": AgentType(agent_type),
            "persona": persona,
            "system_prompt": system_prompt,
            "tools": []
        }
        
        agent = repo_memory.create_agent(agent_data)
        return RedirectResponse(url=f"/web/repos/{repo_id}", status_code=303)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/agents/{agent_id}", response_class=HTMLResponse)
async def agent_detail(request: Request, agent_id: str):
    """Agent detail page"""
    agent = repo_memory.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    repo = repo_memory.get_repository(agent.repo_id)
    messages = repo_memory.get_messages(agent_id=agent_id, limit=20)
    
    return templates.TemplateResponse("agent_detail.html", {
        "request": request,
        "agent": agent,
        "repo": repo,
        "messages": messages
    })

@router.post("/agents/{agent_id}/message")
async def send_message(
    request: Request,
    agent_id: str,
    message: str = Form(...)
):
    """Send message to agent"""
    try:
        result = repo_agent_engine.run_repo_agent(agent_id, message)
        
        # Store the message
        repo_memory.add_message({
            "agent_id": agent_id,
            "repo_id": result.get("repo_id"),
            "message": message,
            "response": result.get("response"),
            "tools_used": result.get("tools_used", [])
        })
        
        return RedirectResponse(url=f"/web/agents/{agent_id}", status_code=303)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/search", response_class=HTMLResponse)
async def search(request: Request, q: Optional[str] = None):
    """Search repositories and agents"""
    results = {"repos": [], "agents": []}
    
    if q:
        # Search repositories
        repos = repo_memory.list_repositories()
        for repo in repos:
            if (q.lower() in repo.name.lower() or 
                q.lower() in (repo.description or "").lower() or
                q.lower() in (repo.language or "").lower()):
                results["repos"].append(repo)
        
        # Search agents
        agents = repo_memory.list_agents()
        for agent in agents:
            if (q.lower() in agent.name.lower() or 
                q.lower() in agent.persona.lower()):
                results["agents"].append(agent)
    
    return templates.TemplateResponse("search.html", {
        "request": request,
        "query": q,
        "results": results
    })