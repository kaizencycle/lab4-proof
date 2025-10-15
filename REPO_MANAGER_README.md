# Repository & Agent Manager

A comprehensive system for managing GitHub repositories and their associated AI agents. This system allows you to create, manage, and interact with specialized agents for each of your repositories.

## 🚀 Features

- **Repository Management**: Add, list, and manage GitHub repositories
- **Agent Creation**: Create specialized agents for each repository
- **Agent Types**: Support for different agent specializations (code review, documentation, testing, deployment, general)
- **Web Interface**: User-friendly web dashboard for management
- **CLI Tool**: Command-line interface for automation
- **API**: RESTful API for integration with other tools
- **Memory System**: Persistent storage for repositories and agents
- **Agent Communication**: Chat with agents about repository-specific topics

## 📁 Project Structure

```
app/
├── repo_models.py          # Data models for repositories and agents
├── repo_storage.py         # Storage system for data persistence
├── repo_agent_engine.py    # Engine for running repository agents
├── repo_web_interface.py   # Web interface routes and templates
├── repo_cli.py            # Command-line interface
├── routers/
│   └── repositories.py    # API endpoints for repository management
└── main.py               # Main FastAPI application

templates/                 # HTML templates for web interface
├── base.html
├── dashboard.html
├── add_repo.html
├── repo_detail.html
├── add_agent.html
├── agent_chat.html
└── error.html

data/repos/               # Data storage directory
├── repositories.json     # Repository data
└── agents.json          # Agent data
```

## 🛠️ Installation & Setup

1. **Install Dependencies**:
   ```bash
   pip install fastapi uvicorn jinja2 python-multipart
   ```

2. **Set Environment Variables**:
   ```bash
   export OPENAI_API_KEY="your-openai-api-key"  # Optional, for AI features
   export REPO_DATA_DIR="data/repos"            # Optional, defaults to data/repos
   ```

3. **Run Setup Script**:
   ```bash
   python setup_repo_manager.py
   ```

4. **Start the Server**:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

5. **Access the Web Interface**:
   Open your browser to `http://localhost:8000/web/`

## 🌐 Web Interface

The web interface provides an intuitive dashboard for managing your repositories and agents:

- **Dashboard**: Overview of repositories, agents, and statistics
- **Repository Management**: Add, view, and manage repositories
- **Agent Management**: Create and configure agents for each repository
- **Agent Chat**: Interactive chat interface with your agents

### Key Pages:
- `/web/` - Main dashboard
- `/web/repos` - List all repositories
- `/web/repos/add` - Add new repository
- `/web/repos/{repo_id}` - Repository details and agents
- `/web/agents/{agent_id}/chat` - Chat with specific agent

## 🔧 Command Line Interface

The CLI tool allows you to manage repositories and agents from the command line:

### Repository Commands:
```bash
# List repositories
python -m app.repo_cli list-repos

# Add repository
python -m app.repo_cli add-repo \
  --name "my-project" \
  --full-name "username/my-project" \
  --url "https://github.com/username/my-project" \
  --clone-url "https://github.com/username/my-project.git" \
  --language "Python" \
  --description "My awesome project"

# List repositories by status
python -m app.repo_cli list-repos --status active
```

### Agent Commands:
```bash
# List agents
python -m app.repo_cli list-agents

# List agents for specific repository
python -m app.repo_cli list-agents --repo-id <REPO_ID>

# Add agent
python -m app.repo_cli add-agent \
  --repo-id <REPO_ID> \
  --name "Code Reviewer" \
  --agent-type "code_reviewer" \
  --persona "A meticulous code reviewer" \
  --system-prompt "You are a senior developer reviewing code..."

# Message agent
python -m app.repo_cli message \
  --agent-id <AGENT_ID> \
  --message "Can you review this code?"

# Get statistics
python -m app.repo_cli stats
```

## 🔌 API Endpoints

The system provides a comprehensive REST API:

### Repository Endpoints:
- `GET /repos/` - List all repositories
- `POST /repos/` - Create new repository
- `GET /repos/{repo_id}` - Get repository details
- `PUT /repos/{repo_id}` - Update repository
- `DELETE /repos/{repo_id}` - Delete repository
- `GET /repos/search?q=query` - Search repositories

### Agent Endpoints:
- `GET /repos/{repo_id}/agents` - List agents for repository
- `POST /repos/{repo_id}/agents` - Create new agent
- `GET /agents/{agent_id}` - Get agent details
- `PUT /agents/{agent_id}` - Update agent
- `DELETE /agents/{agent_id}` - Delete agent
- `POST /agents/{agent_id}/message` - Send message to agent

### Utility Endpoints:
- `GET /repos/stats/overview` - Get overview statistics
- `POST /repos/{repo_id}/agents/suggest` - Get agent suggestions

## 🤖 Agent Types

The system supports several specialized agent types:

1. **Code Reviewer** (`code_reviewer`): Focuses on code quality, bugs, and best practices
2. **Documentation** (`documentation`): Helps with documentation, README files, and guides
3. **Testing** (`testing`): Assists with test creation and testing strategies
4. **Deployment** (`deployment`): Helps with deployment, CI/CD, and infrastructure
5. **General** (`general`): General-purpose agent for various tasks

## 💾 Data Storage

The system uses JSON files for data persistence:
- `data/repos/repositories.json` - Repository data
- `data/repos/agents.json` - Agent data

Data is automatically backed up and can be easily exported/imported.

## 🔄 Usage Examples

### 1. Adding a New Repository
```python
from app.repo_storage import repo_storage

repo_data = {
    "name": "my-awesome-project",
    "full_name": "username/my-awesome-project",
    "description": "An awesome project",
    "url": "https://github.com/username/my-awesome-project",
    "clone_url": "https://github.com/username/my-awesome-project.git",
    "language": "Python",
    "topics": ["python", "web", "api"]
}

repo = repo_storage.create_repository(repo_data)
```

### 2. Creating a Specialized Agent
```python
agent_data = {
    "repo_id": repo.id,
    "name": "Security Expert",
    "agent_type": AgentType.CODE_REVIEWER,
    "persona": "A security-focused code reviewer",
    "system_prompt": "You are a security expert reviewing code for vulnerabilities...",
    "tools": []
}

agent = repo_storage.create_agent(agent_data)
```

### 3. Chatting with an Agent
```python
from app.repo_agent_engine import repo_agent_engine

result = repo_agent_engine.run_repo_agent(
    agent_id="agent-id",
    message="Can you review this authentication code?",
    context={"file": "auth.py", "code": "def authenticate(user): ..."}
)

print(result['response'])
```

## 🎯 Best Practices

1. **Repository Organization**: Use descriptive names and topics for easy discovery
2. **Agent Specialization**: Create focused agents for specific tasks rather than general ones
3. **System Prompts**: Write clear, specific system prompts for better agent performance
4. **Regular Updates**: Keep repository information and agent configurations up to date
5. **Backup**: Regularly backup your data directory

## 🔧 Configuration

### Environment Variables:
- `OPENAI_API_KEY`: OpenAI API key for AI features (optional)
- `REPO_DATA_DIR`: Directory for data storage (default: `data/repos`)
- `OPENAI_MODEL`: OpenAI model to use (default: `gpt-4o-mini`)

### Customization:
- Modify agent types in `repo_models.py`
- Add new tools in `repo_agent_engine.py`
- Customize web interface templates in `templates/`
- Extend CLI commands in `repo_cli.py`

## 🚨 Troubleshooting

### Common Issues:

1. **"Repository already exists"**: Check if repository with same full_name already exists
2. **"Agent not found"**: Verify agent ID is correct and agent exists
3. **"OpenAI API key missing"**: Set OPENAI_API_KEY environment variable
4. **Web interface not loading**: Check if templates directory exists and server is running

### Debug Mode:
```bash
# Run with debug logging
python -m uvicorn app.main:app --reload --log-level debug
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with FastAPI for the web framework
- Uses OpenAI for AI agent capabilities
- Jinja2 for template rendering
- Pydantic for data validation

---

**Happy coding with your AI agents! 🤖✨**