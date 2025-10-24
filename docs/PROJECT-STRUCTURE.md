# Project Structure

This document provides a comprehensive overview of the HIVE-PAW project structure.

## 📁 Directory Overview

```
hive-paw/
├── 📁 backend/                 # Backend API (Python/FastAPI)
│   ├── 📁 api/                # API routes and main application
│   │   ├── 📄 main.py         # FastAPI application entry point
│   │   └── 📁 routers/        # API route modules
│   ├── 📁 core/               # Core business logic
│   │   ├── 📄 models.py       # Pydantic models
│   │   ├── 📄 storage.py      # Data storage utilities
│   │   ├── 📄 hashing.py      # Cryptographic functions
│   │   ├── 📄 auth.py         # Authentication logic
│   │   ├── 📄 memory.py       # Memory management
│   │   ├── 📄 companions.py   # AI companion system
│   │   └── 📄 admin.py        # Admin functionality
│   └── 📁 utils/              # Utility functions
│       ├── 📄 dual_writer.py  # Dual writer functionality
│       └── 📄 archive_endpoint.py # Archive management
├── 📁 frontend/               # Frontend (Next.js/React)
│   ├── 📄 package.json        # Node.js dependencies
│   ├── 📄 next.config.js      # Next.js configuration
│   ├── 📄 postcss.config.js   # PostCSS configuration
│   ├── 📄 .eslintrc.json      # ESLint configuration
│   └── 📁 components/         # React components (when created)
├── 📁 docs/                   # Documentation
│   ├── 📁 api/                # API documentation
│   │   └── 📄 curl-examples-proxy.md
│   ├── 📁 guides/             # User guides
│   │   ├── 📄 ARCHIVE-API-GUIDE.md
│   │   ├── 📄 DAILY-CYCLE-SETUP.md
│   │   ├── 📄 DUAL-WRITER-GUIDE.md
│   │   ├── 📄 FEATURE-TIER-IMPLEMENTATION.md
│   │   ├── 📄 GPG-SETUP-GUIDE.md
│   │   ├── 📄 MCP-SETUP.md
│   │   ├── 📄 MCP-USAGE-GUIDE.md
│   │   ├── 📄 PLUG-AND-PLAY-GUIDE.md
│   │   ├── 📄 QUICKSTART.md
│   │   ├── 📄 README-COMPLETE.md
│   │   ├── 📄 REFLECTIONS-COMPLETE.md
│   │   ├── 📄 roadmap.md
│   │   └── 📄 mcp_recipes.md
│   ├── 📁 deployment/         # Deployment guides
│   │   └── 📄 DEPLOYMENT.md
│   └── 📄 PROJECT-STRUCTURE.md # This file
├── 📁 scripts/                # Automation scripts
│   ├── 📁 powershell/         # PowerShell scripts
│   │   ├── 📄 *.ps1           # Various PowerShell scripts
│   │   └── 📄 *.bat           # Batch files
│   ├── 📁 bash/               # Bash scripts
│   │   └── 📄 *.sh            # Various shell scripts
│   └── 📁 automation/         # CI/CD scripts
├── 📁 tests/                  # Test suite
│   ├── 📁 unit/               # Unit tests
│   │   └── 📄 test_*.py       # Unit test files
│   ├── 📁 integration/        # Integration tests
│   │   └── 📁 preflight/      # Preflight tests
│   └── 📁 fixtures/           # Test fixtures
│       └── 📁 data/           # Test data
├── 📁 config/                 # Configuration files
│   ├── 📄 .env.example        # Environment template
│   ├── 📄 docker-compose.yml  # Docker Compose configuration
│   └── 📄 render.yaml         # Render deployment config
├── 📁 data/                   # Data storage (gitignored)
│   ├── 📁 archive/            # Archived data
│   ├── 📁 backups/            # Backup files
│   └── 📁 logs/               # Log files
├── 📁 examples/               # Example files and patches
│   ├── 📄 export_*.json       # Export examples
│   ├── 📄 *.patch             # Patch files
│   ├── 📄 *.py                # Example Python scripts
│   ├── 📁 lab4-edits/         # Lab4 edit examples
│   └── 📁 .redaction/         # Redaction examples
├── 📁 .github/                # GitHub configuration
│   ├── 📁 workflows/          # GitHub Actions
│   │   └── 📄 ci.yml          # CI/CD pipeline
│   └── 📁 ISSUE_TEMPLATE/     # Issue templates
├── 📄 main.py                 # Application entry point
├── 📄 setup.py                # Python package setup
├── 📄 requirements.txt        # Python dependencies
├── 📄 Dockerfile              # Docker configuration
├── 📄 Makefile                # Development commands
├── 📄 README.md               # Main documentation
├── 📄 CHANGELOG.md            # Version history
├── 📄 CONTRIBUTING.md         # Contribution guidelines
├── 📄 LICENSE                 # MIT License
├── 📄 SECURITY.md             # Security information
└── 📄 .gitignore              # Git ignore rules
```

## 🏗️ Architecture Overview

### Backend Structure

The backend follows a clean architecture pattern:

- **`api/`**: Contains the FastAPI application and route handlers
- **`core/`**: Contains the core business logic, models, and domain services
- **`utils/`**: Contains utility functions and helper modules

### Frontend Structure

The frontend is a Next.js application:

- **`components/`**: Reusable React components
- **`pages/`**: Next.js pages and routing
- **`styles/`**: CSS and styling files
- **`utils/`**: Frontend utility functions

### Documentation Structure

- **`api/`**: API-specific documentation and examples
- **`guides/`**: User guides and tutorials
- **`deployment/`**: Deployment and infrastructure guides

## 🔧 Configuration Files

### Root Level
- `main.py`: Application entry point
- `setup.py`: Python package configuration
- `requirements.txt`: Python dependencies
- `Dockerfile`: Container configuration
- `docker-compose.yml`: Multi-container setup
- `Makefile`: Development commands

### Backend Configuration
- `backend/api/main.py`: FastAPI application
- `backend/core/`: Core business logic
- `backend/utils/`: Utility functions

### Frontend Configuration
- `frontend/package.json`: Node.js dependencies
- `frontend/next.config.js`: Next.js configuration
- `frontend/.eslintrc.json`: ESLint rules

## 📊 Data Flow

1. **API Requests** → `backend/api/main.py`
2. **Route Handling** → `backend/api/routers/`
3. **Business Logic** → `backend/core/`
4. **Data Storage** → `backend/core/storage.py`
5. **Response** → Frontend or API client

## 🧪 Testing Structure

- **Unit Tests**: `tests/unit/` - Test individual functions and classes
- **Integration Tests**: `tests/integration/` - Test component interactions
- **Fixtures**: `tests/fixtures/` - Test data and mock objects

## 🚀 Deployment

- **Docker**: Containerized deployment with `Dockerfile`
- **Docker Compose**: Multi-service setup
- **GitHub Actions**: Automated CI/CD pipeline
- **Render**: Cloud deployment configuration

## 📝 Development Workflow

1. **Setup**: `make install`
2. **Development**: `make dev`
3. **Testing**: `make test`
4. **Linting**: `make lint`
5. **Formatting**: `make format`
6. **Building**: `make build`

This structure provides a clean, maintainable, and scalable foundation for the HIVE-PAW project.