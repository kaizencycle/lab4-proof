# app/repo_agent_engine.py
import os
import json
from typing import Dict, Any, Optional
from openai import OpenAI
from .repo_storage import repo_storage
from .repo_models import RepositoryAgent, GitHubRepository

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

class RepoAgentEngine:
    """Engine for running repository-specific agents"""
    
    def __init__(self):
        self.client = client
    
    def run_repo_agent(self, agent_id: str, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Run a repository-specific agent with a message"""
        try:
            # Get agent and repository information
            agent = repo_storage.get_agent(agent_id)
            if not agent:
                return {"error": "Agent not found"}
            
            if not agent.is_active:
                return {"error": "Agent is not active"}
            
            repo = repo_storage.get_repository(agent.repo_id)
            if not repo:
                return {"error": "Repository not found"}
            
            # Build context-aware system prompt
            system_prompt = self._build_system_prompt(agent, repo, context)
            
            if self.client is None:
                return {
                    "agent_id": agent_id,
                    "repo_id": agent.repo_id,
                    "response": f"[{agent.name} for {repo.name}] {message}",
                    "error": "OpenAI client not available"
                }
            
            # Prepare messages
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ]
            
            # Add context if provided
            if context:
                context_str = json.dumps(context, indent=2)
                messages.append({
                    "role": "user", 
                    "content": f"Additional context:\n{context_str}"
                })
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            response_text = response.choices[0].message.content or ""
            
            # Check if agent wants to use tools
            tools_used = []
            if response_text.startswith("CALL:"):
                tools_used, response_text = self._handle_tool_call(agent, response_text)
            
            return {
                "agent_id": agent_id,
                "repo_id": agent.repo_id,
                "agent_name": agent.name,
                "repo_name": repo.name,
                "response": response_text,
                "tools_used": tools_used,
                "timestamp": agent.updated_at.isoformat()
            }
            
        except Exception as e:
            return {
                "agent_id": agent_id,
                "error": f"Error running agent: {str(e)}"
            }
    
    def _build_system_prompt(self, agent: RepositoryAgent, repo: GitHubRepository, context: Optional[Dict[str, Any]] = None) -> str:
        """Build a context-aware system prompt for the agent"""
        prompt_parts = [
            f"You are {agent.name}, a {agent.agent_type.value} agent for the {repo.name} repository.",
            f"Repository: {repo.full_name}",
            f"Description: {repo.description or 'No description available'}",
            f"Language: {repo.language or 'Unknown'}",
            f"URL: {repo.url}",
        ]
        
        if repo.topics:
            prompt_parts.append(f"Topics: {', '.join(repo.topics)}")
        
        prompt_parts.append(f"\nYour persona: {agent.persona}")
        
        if agent.system_prompt:
            prompt_parts.append(f"\nSystem instructions: {agent.system_prompt}")
        
        # Add available tools
        if agent.tools:
            prompt_parts.append("\nAvailable tools:")
            for tool in agent.tools:
                prompt_parts.append(f"- {tool.get('name', 'Unknown')}: {tool.get('description', 'No description')}")
        
        # Add context if provided
        if context:
            prompt_parts.append(f"\nCurrent context: {json.dumps(context, indent=2)}")
        
        prompt_parts.append("\nRespond helpfully and specifically to the repository context. If you need to use a tool, respond with: CALL:<tool_name>|<json_payload>")
        
        return "\n".join(prompt_parts)
    
    def _handle_tool_call(self, agent: RepositoryAgent, response_text: str) -> tuple[list, str]:
        """Handle tool calls from agent responses"""
        tools_used = []
        
        try:
            if "|" in response_text:
                tool_call, payload = response_text.split("|", 1)
                tool_name = tool_call.replace("CALL:", "").strip()
                
                # Find the tool in agent's tools
                tool = next((t for t in agent.tools if t.get("name") == tool_name), None)
                if tool and "fn" in tool:
                    try:
                        # Parse payload
                        if payload.strip().startswith("{"):
                            payload_obj = json.loads(payload)
                        else:
                            payload_obj = {"text": payload}
                        
                        # Execute tool
                        tool_result = tool["fn"](payload_obj)
                        tools_used.append(tool_name)
                        
                        # Return tool result as response
                        return tools_used, f"Tool '{tool_name}' executed: {str(tool_result)}"
                    except Exception as e:
                        return tools_used, f"Error executing tool '{tool_name}': {str(e)}"
                else:
                    return tools_used, f"Tool '{tool_name}' not found or not callable"
            else:
                return tools_used, response_text
        except Exception as e:
            return tools_used, f"Error parsing tool call: {str(e)}"
    
    def get_agent_suggestions(self, repo_id: str, message: str) -> list[Dict[str, Any]]:
        """Get suggestions for which agents might be helpful for a message"""
        try:
            agents = repo_storage.get_agents_by_repo(repo_id, active_only=True)
            suggestions = []
            
            message_lower = message.lower()
            
            for agent in agents:
                score = 0
                reasons = []
                
                # Score based on agent type and message content
                if agent.agent_type.value == "code_reviewer" and any(word in message_lower for word in ["review", "code", "bug", "fix", "improve"]):
                    score += 3
                    reasons.append("Code review specialist")
                
                if agent.agent_type.value == "documentation" and any(word in message_lower for word in ["doc", "readme", "explain", "guide", "tutorial"]):
                    score += 3
                    reasons.append("Documentation expert")
                
                if agent.agent_type.value == "testing" and any(word in message_lower for word in ["test", "spec", "coverage", "unit", "integration"]):
                    score += 3
                    reasons.append("Testing specialist")
                
                if agent.agent_type.value == "deployment" and any(word in message_lower for word in ["deploy", "build", "ci", "cd", "production"]):
                    score += 3
                    reasons.append("Deployment expert")
                
                # General relevance
                if any(word in message_lower for word in ["help", "how", "what", "why", "explain"]):
                    score += 1
                    reasons.append("General assistance")
                
                if score > 0:
                    suggestions.append({
                        "agent_id": agent.id,
                        "agent_name": agent.name,
                        "agent_type": agent.agent_type.value,
                        "score": score,
                        "reasons": reasons
                    })
            
            # Sort by score
            suggestions.sort(key=lambda x: x["score"], reverse=True)
            return suggestions[:5]  # Return top 5 suggestions
            
        except Exception as e:
            return [{"error": f"Error getting suggestions: {str(e)}"}]

# Global engine instance
repo_agent_engine = RepoAgentEngine()