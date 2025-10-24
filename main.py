#!/usr/bin/env python3
"""
HIVE-PAW API Entry Point

This is the main entry point for the HIVE-PAW API application.
"""

import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

if __name__ == "__main__":
    import uvicorn
    from backend.api.main import app
    
    # Run the FastAPI application
    uvicorn.run(
        "backend.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )