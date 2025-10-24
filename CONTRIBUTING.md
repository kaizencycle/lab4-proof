# Contributing to HIVE-PAW

Thank you for your interest in contributing to HIVE-PAW! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git
- Docker (optional)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/hive-paw.git
   cd hive-paw
   ```

2. **Install Dependencies**
   ```bash
   make install
   # or manually:
   pip install -r requirements.txt
   cd frontend && npm install
   ```

3. **Configure Environment**
   ```bash
   cp config/.env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Servers**
   ```bash
   make dev
   # or manually:
   python main.py &
   cd frontend && npm run dev
   ```

## 📝 Development Guidelines

### Code Style

- **Python**: Follow PEP 8, use Black for formatting, Ruff for linting
- **TypeScript**: Follow ESLint rules, use Prettier for formatting
- **Commits**: Use conventional commit messages

### Project Structure

```
hive-paw/
├── backend/          # Python/FastAPI backend
│   ├── api/         # API routes and main app
│   ├── core/        # Core business logic
│   └── utils/       # Utility functions
├── frontend/         # Next.js/React frontend
├── docs/            # Documentation
├── scripts/         # Automation scripts
├── tests/           # Test suite
└── config/          # Configuration files
```

### Testing

```bash
# Run all tests
make test

# Run specific test categories
pytest tests/unit/
pytest tests/integration/

# Run with coverage
pytest --cov=backend
```

### Linting and Formatting

```bash
# Check code style
make lint

# Fix code style issues
make format
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: OS, Python version, Node.js version
6. **Screenshots**: If applicable

## ✨ Feature Requests

When requesting features, please include:

1. **Description**: Clear description of the feature
2. **Use Case**: Why this feature would be useful
3. **Proposed Solution**: How you think it should work
4. **Alternatives**: Other solutions you've considered

## 🔧 Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Test** your changes: `make test`
5. **Lint** your code: `make lint`
6. **Commit** your changes: `git commit -m 'Add amazing feature'`
7. **Push** to your branch: `git push origin feature/amazing-feature`
8. **Open** a Pull Request

### PR Guidelines

- Use descriptive titles and descriptions
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation as needed

## 📚 Documentation

- Update README.md for significant changes
- Add/update API documentation in `docs/api/`
- Update user guides in `docs/guides/`
- Include code comments for complex logic

## 🔒 Security

- Never commit secrets or API keys
- Use environment variables for configuration
- Report security issues privately to security@hive-paw.com
- Follow security best practices

## 🏷️ Release Process

1. Update version in `setup.py` and `frontend/package.json`
2. Update `CHANGELOG.md`
3. Create a release tag
4. Deploy to production

## 💬 Community

- Join our [Discord](https://discord.gg/hive-paw)
- Follow us on [Twitter](https://twitter.com/hive-paw)
- Check out our [Documentation](https://docs.hive-paw.com)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to HIVE-PAW! 🚀