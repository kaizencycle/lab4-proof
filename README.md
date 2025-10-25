# HIVE-PAW 🚀

A secure, open-source ledger system combining **FastAPI backend** with **Next.js frontend** for reflection tracking and GIC rewards.

[![Security](https://img.shields.io/badge/Security-Public%20Safe-green.svg)](SECURITY.md)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org)

## ✨ Features

- 🏠 **Civic Onboarding Portal** - Complete .gic domain creation with companion-guided setup
- 🔐 **Secure Ledger System** - Immutable daily records with Merkle tree integrity
- 🤖 **AI-Powered Reflections** - Intelligent companion system for personal growth
- 💰 **GIC Rewards** - Gamified incentive system for engagement
- 🔄 **Auto-Merge Workflows** - Automated PR management and deployment
- 🛡️ **Public-Safe** - No hardcoded secrets, environment-based configuration
- 📊 **Admin Dashboard** - Real-time monitoring and analytics
- 🌐 **.gic Domain System** - Sovereign digital identity with integrity scoring

## 📂 Project Structure

```
hive-paw/
├── backend/                 # Backend API (Python/FastAPI)
│   ├── api/                # API routes and main application
│   │   ├── main.py         # FastAPI application entry point
│   │   └── routers/        # API route modules
│   ├── core/               # Core business logic
│   │   ├── models.py       # Pydantic models
│   │   ├── storage.py      # Data storage utilities
│   │   ├── hashing.py      # Cryptographic functions
│   │   ├── auth.py         # Authentication logic
│   │   └── ...
│   └── utils/              # Utility functions
├── frontend/               # Frontend (Next.js/React)
│   ├── components/         # React components
│   ├── pages/             # Next.js pages
│   └── ...
├── docs/                   # Documentation
│   ├── api/               # API documentation
│   ├── guides/            # User guides
│   └── deployment/        # Deployment guides
├── scripts/               # Automation scripts
│   ├── powershell/        # PowerShell scripts
│   ├── bash/             # Bash scripts
│   └── automation/       # CI/CD scripts
├── tests/                 # Test suite
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── fixtures/         # Test fixtures
├── config/               # Configuration files
├── data/                 # Data storage (gitignored)
└── examples/             # Example files and patches
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/hive-paw.git
cd hive-paw
```

### 2. Backend Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp config/.env.example .env
# Edit .env with your configuration

# Run development server
python main.py
```

### 3. Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Run development server
npm run dev
```

### 4. Access Application

- **API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## 🏠 Civic Onboarding System

The HIVE-PAW system now includes a complete civic onboarding portal for creating .gic domains:

### Onboarding Flow

1. **Civic Oath** - Accept terms and create identity
2. **Companion Selection** - Choose JADE, EVE, ZEUS, or HERMES
3. **Domain Customization** - Select template, theme, and sections
4. **Domain Sealing** - Cryptographic attestation to Civic Ledger
5. **First Reflection** - Genesis block creation
6. **Dashboard** - Ongoing portal for reflection management

### Companion System

- **JADE** - The Builder (Rationality: 0.95) - Precision and clarity
- **EVE** - The Reflector (Empathy: 0.95) - Deep understanding
- **ZEUS** - The Arbiter (Balance: 0.88) - Fair judgment
- **HERMES** - The Messenger (Communication: 0.82) - Clear expression

### Integrity Scoring

The system calculates GI (Governance Integrity) scores based on:
- **M (Memory)**: Completeness of reflection history
- **H (Human)**: User engagement and participation  
- **I (Integrity)**: Ledger compliance and attestations
- **E (Ethics)**: Adherence to Civic Oath principles

## 🔧 Configuration

### Environment Variables

Copy `config/.env.example` to `.env` and configure:

```bash
# Required
ADMIN_TOKEN=your_secure_admin_token
ADMIN_KEY=your_secure_admin_key
LEDGER_HMAC_KEY=your_secure_hmac_key

# Optional
DEMO_MODE=false
OPENAI_API_KEY=your_openai_key
```

### Security Configuration

- ✅ All secrets use environment variables
- ✅ No hardcoded credentials
- ✅ CORS protection enabled
- ✅ Admin endpoints protected
- ✅ Data sanitization implemented

## 📚 API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/seed` | POST | Create daily seed |
| `/sweep` | POST | Add reflection sweep |
| `/seal` | POST | Seal daily ledger |
| `/verify/{date}` | GET | Verify ledger integrity |
| `/export/{date}` | GET | Export daily data |

### Admin Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/metrics` | GET | System metrics |
| `/admin/agents` | GET | Agent status |
| `/bonus/run` | POST | Run bonus calculations |

## 🛡️ Security

This repository is **public-safe** with:
- No hardcoded secrets or API keys
- Comprehensive `.gitignore` for sensitive files
- Environment-based configuration
- Security audit checklist in `SECURITY.md`

See [SECURITY.md](SECURITY.md) for detailed security information.

## 🧪 Testing

```bash
# Run all tests
pytest

# Run specific test categories
pytest tests/unit/
pytest tests/integration/

# Run with coverage
pytest --cov=backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pytest`
5. Submit a pull request

## 📄 License

This project is open source. See LICENSE file for details.

## 🆘 Support

- 📖 [Documentation](docs/)
- 🐛 [Issues](https://github.com/yourusername/hive-paw/issues)
- 💬 [Discussions](https://github.com/yourusername/hive-paw/discussions)

---

**Made with ❤️ for the HIVE ecosystem**