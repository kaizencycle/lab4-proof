#!/usr/bin/env python3
"""
Setup script for the Repository and Agent Manager.
This script helps you get started by creating some sample data and testing the system.
"""

import os
import sys
import json
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.repo_storage import repo_storage
from app.repo_models import RepoStatus, AgentType

def create_sample_data():
    """Create some sample repositories and agents for testing"""
    print("🚀 Creating sample data...")
    
    # Sample repositories
    sample_repos = [
        {
            "name": "my-web-app",
            "full_name": "username/my-web-app",
            "description": "A modern web application built with React and Node.js",
            "url": "https://github.com/username/my-web-app",
            "clone_url": "https://github.com/username/my-web-app.git",
            "language": "JavaScript",
            "topics": ["react", "nodejs", "web", "frontend"]
        },
        {
            "name": "data-science-project",
            "full_name": "username/data-science-project",
            "description": "Machine learning project for data analysis",
            "url": "https://github.com/username/data-science-project",
            "clone_url": "https://github.com/username/data-science-project.git",
            "language": "Python",
            "topics": ["python", "machine-learning", "data-science", "jupyter"]
        },
        {
            "name": "api-service",
            "full_name": "username/api-service",
            "description": "RESTful API service with authentication",
            "url": "https://github.com/username/api-service",
            "clone_url": "https://github.com/username/api-service.git",
            "language": "Go",
            "topics": ["go", "api", "rest", "microservice"]
        }
    ]
    
    created_repos = []
    for repo_data in sample_repos:
        try:
            repo = repo_storage.create_repository(repo_data)
            created_repos.append(repo)
            print(f"✅ Created repository: {repo.full_name}")
        except Exception as e:
            print(f"❌ Failed to create repository {repo_data['name']}: {e}")
    
    # Sample agents for each repository
    sample_agents = [
        # Web app agents
        {
            "repo_id": created_repos[0].id if created_repos else None,
            "name": "Code Reviewer",
            "agent_type": AgentType.CODE_REVIEWER,
            "persona": "A meticulous code reviewer who focuses on code quality, best practices, and potential bugs. Always constructive and helpful.",
            "system_prompt": "You are a senior developer reviewing code for a React/Node.js web application. Focus on code quality, performance, security, and maintainability. Provide specific, actionable feedback.",
            "tools": []
        },
        {
            "repo_id": created_repos[0].id if created_repos else None,
            "name": "Documentation Helper",
            "agent_type": AgentType.DOCUMENTATION,
            "persona": "A helpful documentation specialist who loves creating clear, comprehensive documentation for developers.",
            "system_prompt": "You help create and maintain documentation for web applications. Focus on clarity, completeness, and developer experience. Always include code examples and practical guidance.",
            "tools": []
        },
        # Data science agents
        {
            "repo_id": created_repos[1].id if len(created_repos) > 1 else None,
            "name": "ML Mentor",
            "agent_type": AgentType.GENERAL,
            "persona": "An experienced data scientist who guides through machine learning projects, from data preprocessing to model deployment.",
            "system_prompt": "You are a senior data scientist helping with machine learning projects. Focus on best practices, model selection, evaluation metrics, and practical implementation advice.",
            "tools": []
        },
        {
            "repo_id": created_repos[1].id if len(created_repos) > 1 else None,
            "name": "Testing Assistant",
            "agent_type": AgentType.TESTING,
            "persona": "A testing expert who ensures data science code is robust, reliable, and well-tested.",
            "system_prompt": "You help create comprehensive tests for data science projects. Focus on unit tests, integration tests, and data validation. Consider edge cases and error handling.",
            "tools": []
        },
        # API service agents
        {
            "repo_id": created_repos[2].id if len(created_repos) > 2 else None,
            "name": "API Architect",
            "agent_type": AgentType.DEPLOYMENT,
            "persona": "A backend architect who specializes in API design, scalability, and deployment strategies.",
            "system_prompt": "You are a backend architect specializing in Go APIs. Focus on RESTful design, performance, security, scalability, and deployment best practices.",
            "tools": []
        },
        {
            "repo_id": created_repos[2].id if len(created_repos) > 2 else None,
            "name": "Security Guardian",
            "agent_type": AgentType.CODE_REVIEWER,
            "persona": "A security-focused code reviewer who identifies vulnerabilities and ensures secure coding practices.",
            "system_prompt": "You are a security expert reviewing API code. Focus on authentication, authorization, input validation, data protection, and common security vulnerabilities.",
            "tools": []
        }
    ]
    
    created_agents = []
    for agent_data in sample_agents:
        if agent_data["repo_id"]:  # Only create if we have a valid repo_id
            try:
                agent = repo_storage.create_agent(agent_data)
                created_agents.append(agent)
                print(f"✅ Created agent: {agent.name} for {agent_data['repo_id']}")
            except Exception as e:
                print(f"❌ Failed to create agent {agent_data['name']}: {e}")
    
    print(f"\n🎉 Setup complete! Created {len(created_repos)} repositories and {len(created_agents)} agents.")
    return created_repos, created_agents

def print_usage_instructions():
    """Print instructions for using the system"""
    print("\n" + "="*60)
    print("📚 HOW TO USE YOUR REPOSITORY & AGENT MANAGER")
    print("="*60)
    
    print("\n🌐 Web Interface:")
    print("   • Start the server: python -m uvicorn app.main:app --reload")
    print("   • Open your browser: http://localhost:8000/web/")
    print("   • Add repositories, create agents, and chat with them!")
    
    print("\n🔧 Command Line Interface:")
    print("   • List repositories: python -m app.repo_cli list-repos")
    print("   • List agents: python -m app.repo_cli list-agents")
    print("   • Add repository: python -m app.repo_cli add-repo --name 'my-repo' --full-name 'user/my-repo' --url 'https://github.com/user/my-repo' --clone-url 'https://github.com/user/my-repo.git'")
    print("   • Add agent: python -m app.repo_cli add-agent --repo-id <REPO_ID> --name 'My Agent' --agent-type 'general' --persona 'Helpful assistant' --system-prompt 'You are a helpful assistant'")
    print("   • Message agent: python -m app.repo_cli message --agent-id <AGENT_ID> --message 'Hello!'")
    print("   • Get stats: python -m app.repo_cli stats")
    
    print("\n🔌 API Endpoints:")
    print("   • List repos: GET /repos/")
    print("   • Add repo: POST /repos/")
    print("   • List agents: GET /repos/{repo_id}/agents")
    print("   • Message agent: POST /agents/{agent_id}/message")
    print("   • Full API docs: http://localhost:8000/docs")
    
    print("\n💡 Tips:")
    print("   • Each repository can have multiple agents with different specializations")
    print("   • Agents remember their repository context when you chat with them")
    print("   • Use the web interface for easy management, CLI for automation")
    print("   • Check the /web/ endpoint for a user-friendly dashboard")
    
    print("\n" + "="*60)

def main():
    print("🎯 Repository & Agent Manager Setup")
    print("="*40)
    
    # Check if we already have data
    existing_repos = repo_storage.list_repositories()
    if existing_repos:
        print(f"📊 Found {len(existing_repos)} existing repositories.")
        response = input("Do you want to add sample data anyway? (y/N): ").lower().strip()
        if response != 'y':
            print("Skipping sample data creation.")
            print_usage_instructions()
            return
    
    # Create sample data
    try:
        repos, agents = create_sample_data()
        print_usage_instructions()
        
        if repos:
            print(f"\n🔗 Quick Links:")
            print(f"   • Dashboard: http://localhost:8000/web/")
            print(f"   • First repo: http://localhost:8000/web/repos/{repos[0].id}")
            if agents:
                print(f"   • First agent chat: http://localhost:8000/web/agents/{agents[0].id}/chat")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()