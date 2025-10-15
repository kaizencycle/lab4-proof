# app/routers/repositories.py
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
import os

from ..repo_storage import repo_storage
from ..repo_models import (
    RepoCreateRequest,
    AgentCreateRequest,
    AgentUpdateRequest,
    RepoStatus,
    AgentType
)

router = APIRouter(prefix="/repos", tags=["repositories"])

# Repository endpoints
@router.post("/")
async def create_repository(repo_data: RepoCreateRequest):
    """Create a new repository"""
    try:
        # Check if repository already exists
        existing = repo_storage.get_repository_by_name(repo_data.full_name)
        if existing:
            raise HTTPException(
                status_code=400, 
                detail=f"Repository '{repo_data.full_name}' already exists"
            )
        
        repo = repo_storage.create_repository(repo_data.dict())
        return {"ok": True, "repository": repo.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_repositories(
    status: Optional[RepoStatus] = Query(None, description="Filter by repository status"),
    limit: int = Query(100, description="Maximum number of repositories to return")
):
    """List all repositories"""
    try:
        repos = repo_storage.list_repositories(status=status)
        if limit > 0:
            repos = repos[:limit]
        
        return {
            "ok": True,
            "repositories": [repo.dict() for repo in repos],
            "total": len(repos)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{repo_id}")
async def get_repository(repo_id: str):
    """Get a specific repository with its agents"""
    try:
        repo_data = repo_storage.get_repo_with_agents(repo_id)
        if not repo_data:
            raise HTTPException(status_code=404, detail="Repository not found")
        
        return {"ok": True, **repo_data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{repo_id}")
async def update_repository(repo_id: str, updates: dict):
    """Update a repository"""
    try:
        repo = repo_storage.update_repository(repo_id, updates)
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found")
        
        return {"ok": True, "repository": repo.dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{repo_id}")
async def delete_repository(repo_id: str):
    """Delete a repository and all its agents"""
    try:
        success = repo_storage.delete_repository(repo_id)
        if not success:
            raise HTTPException(status_code=404, detail="Repository not found")
        
        return {"ok": True, "message": "Repository and all associated agents deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Agent endpoints
@router.post("/{repo_id}/agents")
async def create_agent(repo_id: str, agent_data: AgentCreateRequest):
    """Create a new agent for a repository"""
    try:
        # Verify repository exists
        repo = repo_storage.get_repository(repo_id)
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found")
        
        # Check if agent name already exists for this repo
        existing_agents = repo_storage.get_agents_by_repo(repo_id, active_only=False)
        if any(agent.name == agent_data.name for agent in existing_agents):
            raise HTTPException(
                status_code=400,
                detail=f"Agent '{agent_data.name}' already exists for this repository"
            )
        
        agent = repo_storage.create_agent({
            **agent_data.dict(),
            "repo_id": repo_id
        })
        
        return {"ok": True, "agent": agent.dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{repo_id}/agents")
async def list_repo_agents(
    repo_id: str,
    agent_type: Optional[AgentType] = Query(None, description="Filter by agent type"),
    active_only: bool = Query(True, description="Only return active agents")
):
    """List all agents for a repository"""
    try:
        # Verify repository exists
        repo = repo_storage.get_repository(repo_id)
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found")
        
        agents = repo_storage.get_agents_by_repo(repo_id, active_only=active_only)
        
        if agent_type:
            agents = [agent for agent in agents if agent.agent_type == agent_type]
        
        return {
            "ok": True,
            "agents": [agent.dict() for agent in agents],
            "total": len(agents)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get a specific agent"""
    try:
        agent = repo_storage.get_agent(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        return {"ok": True, "agent": agent.dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/agents/{agent_id}")
async def update_agent(agent_id: str, updates: AgentUpdateRequest):
    """Update an agent"""
    try:
        # Filter out None values
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        
        agent = repo_storage.update_agent(agent_id, update_data)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        return {"ok": True, "agent": agent.dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete an agent"""
    try:
        success = repo_storage.delete_agent(agent_id)
        if not success:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        return {"ok": True, "message": "Agent deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Agent communication endpoints
@router.post("/agents/{agent_id}/message")
async def message_agent(agent_id: str, message_data: dict):
    """Send a message to a specific agent"""
    try:
        from ..repo_agent_engine import repo_agent_engine
        
        message = message_data.get('message', '')
        context = message_data.get('context')
        
        if not message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        result = repo_agent_engine.run_repo_agent(agent_id, message, context)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {"ok": True, **result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{repo_id}/agents/suggest")
async def suggest_agents(repo_id: str, message_data: dict):
    """Get suggestions for which agents might be helpful for a message"""
    try:
        from ..repo_agent_engine import repo_agent_engine
        
        message = message_data.get('message', '')
        if not message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        suggestions = repo_agent_engine.get_agent_suggestions(repo_id, message)
        
        return {
            "ok": True,
            "suggestions": suggestions,
            "total": len(suggestions)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Utility endpoints
@router.get("/search")
async def search_repositories(
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, description="Maximum number of results")
):
    """Search repositories by name, description, or language"""
    try:
        query = q.lower()
        all_repos = repo_storage.list_repositories()
        
        matching_repos = []
        for repo in all_repos:
            if (query in repo.name.lower() or 
                query in (repo.description or "").lower() or
                query in (repo.language or "").lower() or
                any(query in topic.lower() for topic in repo.topics)):
                matching_repos.append(repo)
        
        if limit > 0:
            matching_repos = matching_repos[:limit]
        
        return {
            "ok": True,
            "repositories": [repo.dict() for repo in matching_repos],
            "total": len(matching_repos),
            "query": q
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/overview")
async def get_overview_stats():
    """Get overview statistics"""
    try:
        repos = repo_storage.list_repositories()
        agents = repo_storage.list_agents()
        
        # Count by status
        repo_status_counts = {}
        for repo in repos:
            status = repo.status.value
            repo_status_counts[status] = repo_status_counts.get(status, 0) + 1
        
        # Count by agent type
        agent_type_counts = {}
        for agent in agents:
            agent_type = agent.agent_type.value
            agent_type_counts[agent_type] = agent_type_counts.get(agent_type, 0) + 1
        
        # Count by language
        language_counts = {}
        for repo in repos:
            if repo.language:
                language_counts[repo.language] = language_counts.get(repo.language, 0) + 1
        
        return {
            "ok": True,
            "stats": {
                "total_repositories": len(repos),
                "total_agents": len(agents),
                "active_agents": len([a for a in agents if a.is_active]),
                "repository_status": repo_status_counts,
                "agent_types": agent_type_counts,
                "languages": language_counts
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))