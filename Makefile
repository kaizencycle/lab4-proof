# HIVE-PAW Makefile
# Common development tasks

.PHONY: help install dev test clean lint format build deploy

# Default target
help:
	@echo "HIVE-PAW Development Commands"
	@echo "============================="
	@echo "install     - Install all dependencies"
	@echo "dev         - Start development servers"
	@echo "test        - Run all tests"
	@echo "lint        - Run linting"
	@echo "format      - Format code"
	@echo "build       - Build for production"
	@echo "clean       - Clean build artifacts"
	@echo "deploy      - Deploy to production"

# Install dependencies
install:
	@echo "Installing Python dependencies..."
	pip install -r requirements.txt
	@echo "Installing Node.js dependencies..."
	cd frontend && npm install

# Start development servers
dev:
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	python main.py &
	cd frontend && npm run dev

# Run tests
test:
	@echo "Running tests..."
	pytest tests/ -v --cov=backend

# Run linting
lint:
	@echo "Running Python linting..."
	ruff check backend/
	@echo "Running TypeScript linting..."
	cd frontend && npm run lint

# Format code
format:
	@echo "Formatting Python code..."
	black backend/
	ruff check --fix backend/
	@echo "Formatting TypeScript code..."
	cd frontend && npm run lint -- --fix

# Build for production
build:
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "Building complete!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf frontend/.next/
	rm -rf frontend/out/
	rm -rf backend/__pycache__/
	rm -rf backend/**/__pycache__/
	rm -rf .pytest_cache/
	rm -rf .coverage
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

# Deploy (placeholder)
deploy:
	@echo "Deployment not configured yet"
	@echo "Please configure your deployment pipeline"