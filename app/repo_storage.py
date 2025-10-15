# app/repo_storage.py
import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

from .repo_models import (
    GitHubRepository, 
    RepositoryAgent, 
    RepoStatus, 
    AgentType
)

# Storage configuration
REPO_DATA_DIR = Path(os.getenv("REPO_DATA_DIR", "data/repos"))
REPO_DATA_DIR.mkdir(parents=True, exist_ok=True)

REPOS_FILE = REPO_DATA_DIR / "repositories.json"
AGENTS_FILE = REPO_DATA_DIR / "agents.json"

class RepoStorage:
    """Storage manager for repositories and agents"""
    
    def __init__(self):
        self.repos: Dict[str, GitHubRepository] = {}
        self.agents: Dict[str, RepositoryAgent] = {}
        self._load_data()
    
    def _load_data(self):
        """Load repository and agent data from files"""
        # Load repositories
        if REPOS_FILE.exists():
            try:
                with open(REPOS_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for repo_data in data.get('repositories', []):
                        repo = GitHubRepository(**repo_data)
                        self.repos[repo.id] = repo
            except Exception as e:
                print(f"Error loading repositories: {e}")
        
        # Load agents
        if AGENTS_FILE.exists():
            try:
                with open(AGENTS_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for agent_data in data.get('agents', []):
                        agent = RepositoryAgent(**agent_data)
                        self.agents[agent.id] = agent
            except Exception as e:
                print(f"Error loading agents: {e}")
    
    def _save_repos(self):
        """Save repositories to file"""
        try:
            data = {
                'repositories': [repo.dict() for repo in self.repos.values()],
                'last_updated': datetime.utcnow().isoformat()
            }
            with open(REPOS_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        except Exception as e:
            print(f"Error saving repositories: {e}")
    
    def _save_agents(self):
        """Save agents to file"""
        try:
            data = {
                'agents': [agent.dict() for agent in self.agents.values()],
                'last_updated': datetime.utcnow().isoformat()
            }
            with open(AGENTS_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        except Exception as e:
            print(f"Error saving agents: {e}")
    
    # Repository methods
    def create_repository(self, repo_data: Dict[str, Any]) -> GitHubRepository:
        """Create a new repository"""
        repo_id = str(uuid.uuid4())
        repo = GitHubRepository(
            id=repo_id,
            **repo_data
        )
        self.repos[repo_id] = repo
        self._save_repos()
        return repo
    
    def get_repository(self, repo_id: str) -> Optional[GitHubRepository]:
        """Get a repository by ID"""
        return self.repos.get(repo_id)
    
    def get_repository_by_name(self, full_name: str) -> Optional[GitHubRepository]:
        """Get a repository by full name (owner/repo)"""
        for repo in self.repos.values():
            if repo.full_name == full_name:
                return repo
        return None
    
    def list_repositories(self, status: Optional[RepoStatus] = None) -> List[GitHubRepository]:
        """List all repositories, optionally filtered by status"""
        repos = list(self.repos.values())
        if status:
            repos = [repo for repo in repos if repo.status == status]
        return sorted(repos, key=lambda x: x.updated_at, reverse=True)
    
    def update_repository(self, repo_id: str, updates: Dict[str, Any]) -> Optional[GitHubRepository]:
        """Update a repository"""
        if repo_id not in self.repos:
            return None
        
        repo = self.repos[repo_id]
        for key, value in updates.items():
            if hasattr(repo, key):
                setattr(repo, key, value)
        
        repo.updated_at = datetime.utcnow()
        self._save_repos()
        return repo
    
    def delete_repository(self, repo_id: str) -> bool:
        """Delete a repository and all its agents"""
        if repo_id not in self.repos:
            return False
        
        # Delete all agents for this repository
        agent_ids_to_delete = [
            agent_id for agent_id, agent in self.agents.items()
            if agent.repo_id == repo_id
        ]
        for agent_id in agent_ids_to_delete:
            del self.agents[agent_id]
        
        # Delete the repository
        del self.repos[repo_id]
        
        self._save_repos()
        self._save_agents()
        return True
    
    # Agent methods
    def create_agent(self, agent_data: Dict[str, Any]) -> RepositoryAgent:
        """Create a new repository agent"""
        agent_id = str(uuid.uuid4())
        agent = RepositoryAgent(
            id=agent_id,
            **agent_data
        )
        self.agents[agent_id] = agent
        self._save_agents()
        return agent
    
    def get_agent(self, agent_id: str) -> Optional[RepositoryAgent]:
        """Get an agent by ID"""
        return self.agents.get(agent_id)
    
    def get_agents_by_repo(self, repo_id: str, active_only: bool = True) -> List[RepositoryAgent]:
        """Get all agents for a repository"""
        agents = [agent for agent in self.agents.values() if agent.repo_id == repo_id]
        if active_only:
            agents = [agent for agent in agents if agent.is_active]
        return sorted(agents, key=lambda x: x.created_at)
    
    def list_agents(self, repo_id: Optional[str] = None, agent_type: Optional[AgentType] = None) -> List[RepositoryAgent]:
        """List all agents, optionally filtered by repository or type"""
        agents = list(self.agents.values())
        
        if repo_id:
            agents = [agent for agent in agents if agent.repo_id == repo_id]
        
        if agent_type:
            agents = [agent for agent in agents if agent.agent_type == agent_type]
        
        return sorted(agents, key=lambda x: x.updated_at, reverse=True)
    
    def update_agent(self, agent_id: str, updates: Dict[str, Any]) -> Optional[RepositoryAgent]:
        """Update an agent"""
        if agent_id not in self.agents:
            return None
        
        agent = self.agents[agent_id]
        for key, value in updates.items():
            if hasattr(agent, key):
                setattr(agent, key, value)
        
        agent.updated_at = datetime.utcnow()
        self._save_agents()
        return agent
    
    def delete_agent(self, agent_id: str) -> bool:
        """Delete an agent"""
        if agent_id not in self.agents:
            return False
        
        del self.agents[agent_id]
        self._save_agents()
        return True
    
    def get_repo_with_agents(self, repo_id: str) -> Optional[Dict[str, Any]]:
        """Get a repository with all its agents"""
        repo = self.get_repository(repo_id)
        if not repo:
            return None
        
        agents = self.get_agents_by_repo(repo_id, active_only=False)
        return {
            'repository': repo.dict(),
            'agents': [agent.dict() for agent in agents]
        }

# Global storage instance
repo_storage = RepoStorage()