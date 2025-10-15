# app/repo_memory.py
import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid

from .repo_models import GitHubRepository, RepositoryAgent, RepoStatus, AgentType

class RepoMemory:
    """Memory system for repository and agent data persistence"""
    
    def __init__(self, data_dir: str = "data/repos"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # File paths
        self.repos_file = self.data_dir / "repositories.json"
        self.agents_file = self.data_dir / "agents.json"
        self.messages_file = self.data_dir / "messages.json"
        self.sessions_file = self.data_dir / "sessions.json"
        
        # In-memory caches
        self._repos_cache: Dict[str, GitHubRepository] = {}
        self._agents_cache: Dict[str, RepositoryAgent] = {}
        self._messages_cache: List[Dict[str, Any]] = []
        self._sessions_cache: Dict[str, Dict[str, Any]] = {}
        
        self._load_all_data()
    
    def _load_all_data(self):
        """Load all data from files into memory"""
        self._load_repositories()
        self._load_agents()
        self._load_messages()
        self._load_sessions()
    
    def _load_repositories(self):
        """Load repositories from file"""
        if self.repos_file.exists():
            try:
                with open(self.repos_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for repo_data in data.get('repositories', []):
                        repo = GitHubRepository(**repo_data)
                        self._repos_cache[repo.id] = repo
            except Exception as e:
                print(f"Error loading repositories: {e}")
    
    def _load_agents(self):
        """Load agents from file"""
        if self.agents_file.exists():
            try:
                with open(self.agents_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for agent_data in data.get('agents', []):
                        agent = RepositoryAgent(**agent_data)
                        self._agents_cache[agent.id] = agent
            except Exception as e:
                print(f"Error loading agents: {e}")
    
    def _load_messages(self):
        """Load messages from file"""
        if self.messages_file.exists():
            try:
                with open(self.messages_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self._messages_cache = data.get('messages', [])
            except Exception as e:
                print(f"Error loading messages: {e}")
    
    def _load_sessions(self):
        """Load sessions from file"""
        if self.sessions_file.exists():
            try:
                with open(self.sessions_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self._sessions_cache = data.get('sessions', {})
            except Exception as e:
                print(f"Error loading sessions: {e}")
    
    def _save_repositories(self):
        """Save repositories to file"""
        try:
            data = {
                'repositories': [repo.dict() for repo in self._repos_cache.values()],
                'last_updated': datetime.utcnow().isoformat()
            }
            with open(self.repos_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        except Exception as e:
            print(f"Error saving repositories: {e}")
    
    def _save_agents(self):
        """Save agents to file"""
        try:
            data = {
                'agents': [agent.dict() for agent in self._agents_cache.values()],
                'last_updated': datetime.utcnow().isoformat()
            }
            with open(self.agents_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        except Exception as e:
            print(f"Error saving agents: {e}")
    
    def _save_messages(self):
        """Save messages to file"""
        try:
            data = {
                'messages': self._messages_cache,
                'last_updated': datetime.utcnow().isoformat()
            }
            with open(self.messages_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        except Exception as e:
            print(f"Error saving messages: {e}")
    
    def _save_sessions(self):
        """Save sessions to file"""
        try:
            data = {
                'sessions': self._sessions_cache,
                'last_updated': datetime.utcnow().isoformat()
            }
            with open(self.sessions_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        except Exception as e:
            print(f"Error saving sessions: {e}")
    
    # Repository methods
    def create_repository(self, repo_data: Dict[str, Any]) -> GitHubRepository:
        """Create a new repository"""
        repo_id = str(uuid.uuid4())
        repo = GitHubRepository(
            id=repo_id,
            **repo_data
        )
        self._repos_cache[repo_id] = repo
        self._save_repositories()
        return repo
    
    def get_repository(self, repo_id: str) -> Optional[GitHubRepository]:
        """Get a repository by ID"""
        return self._repos_cache.get(repo_id)
    
    def get_repository_by_name(self, full_name: str) -> Optional[GitHubRepository]:
        """Get a repository by full name"""
        for repo in self._repos_cache.values():
            if repo.full_name == full_name:
                return repo
        return None
    
    def list_repositories(self, status: Optional[RepoStatus] = None) -> List[GitHubRepository]:
        """List all repositories"""
        repos = list(self._repos_cache.values())
        if status:
            repos = [repo for repo in repos if repo.status == status]
        return sorted(repos, key=lambda x: x.updated_at, reverse=True)
    
    def update_repository(self, repo_id: str, updates: Dict[str, Any]) -> Optional[GitHubRepository]:
        """Update a repository"""
        if repo_id not in self._repos_cache:
            return None
        
        repo = self._repos_cache[repo_id]
        for key, value in updates.items():
            if hasattr(repo, key):
                setattr(repo, key, value)
        
        repo.updated_at = datetime.utcnow()
        self._save_repositories()
        return repo
    
    def delete_repository(self, repo_id: str) -> bool:
        """Delete a repository"""
        if repo_id not in self._repos_cache:
            return False
        
        # Delete all agents for this repository
        agent_ids_to_delete = [
            agent_id for agent_id, agent in self._agents_cache.items()
            if agent.repo_id == repo_id
        ]
        for agent_id in agent_ids_to_delete:
            del self._agents_cache[agent_id]
        
        del self._repos_cache[repo_id]
        self._save_repositories()
        self._save_agents()
        return True
    
    # Agent methods
    def create_agent(self, agent_data: Dict[str, Any]) -> RepositoryAgent:
        """Create a new agent"""
        agent_id = str(uuid.uuid4())
        agent = RepositoryAgent(
            id=agent_id,
            **agent_data
        )
        self._agents_cache[agent_id] = agent
        self._save_agents()
        return agent
    
    def get_agent(self, agent_id: str) -> Optional[RepositoryAgent]:
        """Get an agent by ID"""
        return self._agents_cache.get(agent_id)
    
    def get_agents_by_repo(self, repo_id: str, active_only: bool = True) -> List[RepositoryAgent]:
        """Get all agents for a repository"""
        agents = [agent for agent in self._agents_cache.values() if agent.repo_id == repo_id]
        if active_only:
            agents = [agent for agent in agents if agent.is_active]
        return sorted(agents, key=lambda x: x.created_at)
    
    def list_agents(self, repo_id: Optional[str] = None, agent_type: Optional[AgentType] = None) -> List[RepositoryAgent]:
        """List all agents"""
        agents = list(self._agents_cache.values())
        
        if repo_id:
            agents = [agent for agent in agents if agent.repo_id == repo_id]
        
        if agent_type:
            agents = [agent for agent in agents if agent.agent_type == agent_type]
        
        return sorted(agents, key=lambda x: x.updated_at, reverse=True)
    
    def update_agent(self, agent_id: str, updates: Dict[str, Any]) -> Optional[RepositoryAgent]:
        """Update an agent"""
        if agent_id not in self._agents_cache:
            return None
        
        agent = self._agents_cache[agent_id]
        for key, value in updates.items():
            if hasattr(agent, key):
                setattr(agent, key, value)
        
        agent.updated_at = datetime.utcnow()
        self._save_agents()
        return agent
    
    def delete_agent(self, agent_id: str) -> bool:
        """Delete an agent"""
        if agent_id not in self._agents_cache:
            return False
        
        del self._agents_cache[agent_id]
        self._save_agents()
        return True
    
    # Message methods
    def add_message(self, message_data: Dict[str, Any]) -> str:
        """Add a message to the conversation history"""
        message_id = str(uuid.uuid4())
        message = {
            "id": message_id,
            "timestamp": datetime.utcnow().isoformat(),
            **message_data
        }
        self._messages_cache.append(message)
        self._save_messages()
        return message_id
    
    def get_messages(self, repo_id: Optional[str] = None, agent_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Get messages with optional filtering"""
        messages = self._messages_cache
        
        if repo_id:
            messages = [msg for msg in messages if msg.get("repo_id") == repo_id]
        
        if agent_id:
            messages = [msg for msg in messages if msg.get("agent_id") == agent_id]
        
        return sorted(messages, key=lambda x: x["timestamp"], reverse=True)[:limit]
    
    # Session methods
    def create_session(self, session_data: Dict[str, Any]) -> str:
        """Create a new session"""
        session_id = str(uuid.uuid4())
        session = {
            "id": session_id,
            "created_at": datetime.utcnow().isoformat(),
            "last_activity": datetime.utcnow().isoformat(),
            **session_data
        }
        self._sessions_cache[session_id] = session
        self._save_sessions()
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get a session by ID"""
        return self._sessions_cache.get(session_id)
    
    def update_session(self, session_id: str, updates: Dict[str, Any]) -> bool:
        """Update a session"""
        if session_id not in self._sessions_cache:
            return False
        
        session = self._sessions_cache[session_id]
        session.update(updates)
        session["last_activity"] = datetime.utcnow().isoformat()
        self._save_sessions()
        return True
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session"""
        if session_id not in self._sessions_cache:
            return False
        
        del self._sessions_cache[session_id]
        self._save_sessions()
        return True
    
    # Utility methods
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
    
    def get_stats(self) -> Dict[str, Any]:
        """Get overall statistics"""
        repos = list(self._repos_cache.values())
        agents = list(self._agents_cache.values())
        
        return {
            "total_repositories": len(repos),
            "total_agents": len(agents),
            "active_agents": len([a for a in agents if a.is_active]),
            "total_messages": len(self._messages_cache),
            "active_sessions": len(self._sessions_cache),
            "repository_status_counts": {
                status.value: len([r for r in repos if r.status == status])
                for status in RepoStatus
            },
            "agent_type_counts": {
                agent_type.value: len([a for a in agents if a.agent_type == agent_type])
                for agent_type in AgentType
            }
        }

# Global memory instance
repo_memory = RepoMemory()