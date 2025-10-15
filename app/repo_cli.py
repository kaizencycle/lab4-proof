#!/usr/bin/env python3
# app/repo_cli.py
"""
Command-line interface for managing GitHub repositories and agents.
"""

import argparse
import json
import sys
from typing import Dict, Any, List
from .repo_memory import repo_memory
from .repo_models import RepoStatus, AgentType

def print_json(data: Any, indent: int = 2):
    """Pretty print JSON data"""
    print(json.dumps(data, indent=indent, ensure_ascii=False, default=str))

def cmd_list_repos(args):
    """List repositories"""
    repos = repo_memory.list_repositories()
    if args.json:
        print_json([repo.dict() for repo in repos])
    else:
        print(f"Found {len(repos)} repositories:")
        for repo in repos:
            print(f"  {repo.name} ({repo.full_name}) - {repo.status.value}")
            if repo.description:
                print(f"    {repo.description}")
            print(f"    Language: {repo.language or 'Unknown'}")
            print(f"    URL: {repo.url}")
            print()

def cmd_add_repo(args):
    """Add a new repository"""
    repo_data = {
        "name": args.name,
        "full_name": args.full_name,
        "description": args.description,
        "url": args.url,
        "clone_url": args.clone_url,
        "language": args.language,
        "topics": args.topics.split(",") if args.topics else []
    }
    
    repo = repo_memory.create_repository(repo_data)
    print(f"Created repository: {repo.name} ({repo.id})")
    if args.json:
        print_json(repo.dict())

def cmd_list_agents(args):
    """List agents"""
    agents = repo_memory.list_agents()
    if args.repo_id:
        agents = [agent for agent in agents if agent.repo_id == args.repo_id]
    
    if args.json:
        print_json([agent.dict() for agent in agents])
    else:
        print(f"Found {len(agents)} agents:")
        for agent in agents:
            repo = repo_memory.get_repository(agent.repo_id)
            repo_name = repo.name if repo else "Unknown"
            status = "Active" if agent.is_active else "Inactive"
            print(f"  {agent.name} ({agent.agent_type.value}) - {repo_name} - {status}")
            print(f"    {agent.persona}")
            print()

def cmd_add_agent(args):
    """Add a new agent"""
    # Verify repository exists
    repo = repo_memory.get_repository(args.repo_id)
    if not repo:
        print(f"Error: Repository {args.repo_id} not found")
        return
    
    agent_data = {
        "repo_id": args.repo_id,
        "name": args.name,
        "agent_type": AgentType(args.agent_type),
        "persona": args.persona,
        "system_prompt": args.system_prompt,
        "tools": []
    }
    
    agent = repo_memory.create_agent(agent_data)
    print(f"Created agent: {agent.name} for {repo.name}")
    if args.json:
        print_json(agent.dict())

def cmd_message_agent(args):
    """Send a message to an agent"""
    from .repo_agent_engine import repo_agent_engine
    
    result = repo_agent_engine.run_repo_agent(args.agent_id, args.message)
    
    if args.json:
        print_json(result)
    else:
        if "error" in result:
            print(f"Error: {result['error']}")
        else:
            print(f"[{result.get('agent_name', 'Unknown')}] {result.get('response', 'No response')}")

def cmd_stats(args):
    """Show statistics"""
    stats = repo_memory.get_stats()
    if args.json:
        print_json(stats)
    else:
        print("Repository and Agent Statistics:")
        print(f"  Total repositories: {stats['total_repositories']}")
        print(f"  Total agents: {stats['total_agents']}")
        print(f"  Active agents: {stats['active_agents']}")
        print(f"  Total messages: {stats['total_messages']}")
        print(f"  Active sessions: {stats['active_sessions']}")
        print()
        
        print("Repository status distribution:")
        for status, count in stats['repository_status_counts'].items():
            print(f"  {status}: {count}")
        print()
        
        print("Agent type distribution:")
        for agent_type, count in stats['agent_type_counts'].items():
            print(f"  {agent_type}: {count}")

def main():
    parser = argparse.ArgumentParser(description="Manage GitHub repositories and agents")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Repository commands
    repo_parser = subparsers.add_parser("repos", help="List repositories")
    repo_parser.set_defaults(func=cmd_list_repos)
    
    add_repo_parser = subparsers.add_parser("add-repo", help="Add a new repository")
    add_repo_parser.add_argument("--name", required=True, help="Repository name")
    add_repo_parser.add_argument("--full-name", required=True, help="Full repository name (owner/repo)")
    add_repo_parser.add_argument("--description", help="Repository description")
    add_repo_parser.add_argument("--url", required=True, help="Repository URL")
    add_repo_parser.add_argument("--clone-url", required=True, help="Clone URL")
    add_repo_parser.add_argument("--language", help="Primary language")
    add_repo_parser.add_argument("--topics", help="Comma-separated topics")
    add_repo_parser.set_defaults(func=cmd_add_repo)
    
    # Agent commands
    agents_parser = subparsers.add_parser("agents", help="List agents")
    agents_parser.add_argument("--repo-id", help="Filter by repository ID")
    agents_parser.set_defaults(func=cmd_list_agents)
    
    add_agent_parser = subparsers.add_parser("add-agent", help="Add a new agent")
    add_agent_parser.add_argument("--repo-id", required=True, help="Repository ID")
    add_agent_parser.add_argument("--name", required=True, help="Agent name")
    add_agent_parser.add_argument("--agent-type", required=True, 
                                choices=[t.value for t in AgentType],
                                help="Agent type")
    add_agent_parser.add_argument("--persona", required=True, help="Agent persona")
    add_agent_parser.add_argument("--system-prompt", required=True, help="System prompt")
    add_agent_parser.set_defaults(func=cmd_add_agent)
    
    # Message command
    message_parser = subparsers.add_parser("message", help="Send message to agent")
    message_parser.add_argument("--agent-id", required=True, help="Agent ID")
    message_parser.add_argument("--message", required=True, help="Message to send")
    message_parser.set_defaults(func=cmd_message_agent)
    
    # Stats command
    stats_parser = subparsers.add_parser("stats", help="Show statistics")
    stats_parser.set_defaults(func=cmd_stats)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    try:
        args.func(args)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()