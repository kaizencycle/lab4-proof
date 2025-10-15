# app/repo_models.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class RepoStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"

class AgentType(str, Enum):
    CODE_REVIEWER = "code_reviewer"
    DOCUMENTATION = "documentation"
    TESTING = "testing"
    DEPLOYMENT = "deployment"
    GENERAL = "general"

class GitHubRepository(BaseModel):
    """Model for GitHub repository information"""
    id: str = Field(..., description="Unique identifier for the repository")
    name: str = Field(..., description="Repository name")
    full_name: str = Field(..., description="Full repository name (owner/repo)")
    description: Optional[str] = Field(None, description="Repository description")
    url: str = Field(..., description="GitHub repository URL")
    clone_url: str = Field(..., description="Git clone URL")
    language: Optional[str] = Field(None, description="Primary programming language")
    topics: List[str] = Field(default_factory=list, description="Repository topics/tags")
    status: RepoStatus = Field(default=RepoStatus.ACTIVE, description="Repository status")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    meta: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

class RepositoryAgent(BaseModel):
    """Model for repository-specific agents"""
    id: str = Field(..., description="Unique identifier for the agent")
    repo_id: str = Field(..., description="ID of the associated repository")
    name: str = Field(..., description="Agent name")
    agent_type: AgentType = Field(..., description="Type of agent")
    persona: str = Field(..., description="Agent persona/description")
    system_prompt: str = Field(..., description="System prompt for the agent")
    tools: List[Dict[str, Any]] = Field(default_factory=list, description="Available tools")
    is_active: bool = Field(default=True, description="Whether the agent is active")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    meta: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

class RepoAgentMessage(BaseModel):
    """Model for messages to repository agents"""
    repo_id: str = Field(..., description="Repository ID")
    agent_id: str = Field(..., description="Agent ID")
    message: str = Field(..., description="Message content")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")

class RepoAgentResponse(BaseModel):
    """Model for responses from repository agents"""
    agent_id: str = Field(..., description="Agent ID that responded")
    repo_id: str = Field(..., description="Repository ID")
    response: str = Field(..., description="Agent response")
    tools_used: Optional[List[str]] = Field(None, description="Tools used by the agent")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class RepoCreateRequest(BaseModel):
    """Request model for creating a new repository"""
    name: str = Field(..., description="Repository name")
    full_name: str = Field(..., description="Full repository name (owner/repo)")
    description: Optional[str] = Field(None, description="Repository description")
    url: str = Field(..., description="GitHub repository URL")
    clone_url: str = Field(..., description="Git clone URL")
    language: Optional[str] = Field(None, description="Primary programming language")
    topics: List[str] = Field(default_factory=list, description="Repository topics/tags")

class AgentCreateRequest(BaseModel):
    """Request model for creating a new repository agent"""
    repo_id: str = Field(..., description="Repository ID")
    name: str = Field(..., description="Agent name")
    agent_type: AgentType = Field(..., description="Type of agent")
    persona: str = Field(..., description="Agent persona/description")
    system_prompt: str = Field(..., description="System prompt for the agent")
    tools: List[Dict[str, Any]] = Field(default_factory=list, description="Available tools")

class AgentUpdateRequest(BaseModel):
    """Request model for updating an existing agent"""
    name: Optional[str] = Field(None, description="Agent name")
    persona: Optional[str] = Field(None, description="Agent persona/description")
    system_prompt: Optional[str] = Field(None, description="System prompt for the agent")
    tools: Optional[List[Dict[str, Any]]] = Field(None, description="Available tools")
    is_active: Optional[bool] = Field(None, description="Whether the agent is active")