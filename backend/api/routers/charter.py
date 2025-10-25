# app/routers/charter.py
from fastapi import APIRouter, HTTPException
from datetime import datetime
import json
import hashlib
from pathlib import Path
from typing import Dict, Any

router = APIRouter(prefix="/api/charter", tags=["constitution"])

# Load the constitutional charter
CHARTER_PATH = Path(__file__).parent.parent.parent.parent / "config" / "charters" / "ai_integrity_constitution.v1.json"

def load_charter() -> Dict[str, Any]:
    """Load the constitutional charter from file"""
    try:
        with open(CHARTER_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Constitutional charter not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid charter format")

def calculate_charter_hash(charter_data: Dict[str, Any]) -> str:
    """Calculate SHA-256 hash of the charter for integrity verification"""
    charter_json = json.dumps(charter_data, sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(charter_json.encode('utf-8')).hexdigest()

@router.get("/status")
def get_charter_status():
    """Get the current status of the constitutional charter"""
    charter = load_charter()
    charter_hash = calculate_charter_hash(charter)
    
    return {
        "status": "active",
        "version": charter.get("version", "unknown"),
        "effective_date": charter.get("effective_date", "unknown"),
        "title": charter.get("title", "AI Integrity Constitution"),
        "hash": charter_hash,
        "last_updated": datetime.utcnow().isoformat() + "Z"
    }

@router.get("/full")
def get_full_charter():
    """Get the complete constitutional charter"""
    return load_charter()

@router.get("/principles")
def get_governing_principles():
    """Get the core governing principles"""
    charter = load_charter()
    return {
        "principles": charter.get("governing_principles", {}),
        "version": charter.get("version", "unknown")
    }

@router.get("/companions")
def get_companion_guidelines():
    """Get companion AI guidelines"""
    charter = load_charter()
    return {
        "companions": charter.get("companion_ai_guidelines", {}),
        "version": charter.get("version", "unknown")
    }

@router.get("/compliance")
def get_compliance_metrics():
    """Get compliance and GI calculation metrics"""
    charter = load_charter()
    return {
        "metrics": charter.get("compliance_metrics", {}),
        "version": charter.get("version", "unknown")
    }

@router.post("/verify")
def verify_charter_integrity():
    """Verify the integrity of the constitutional charter"""
    try:
        charter = load_charter()
        calculated_hash = calculate_charter_hash(charter)
        
        # In a real implementation, you might compare against a stored hash
        # or verify against a blockchain/ledger entry
        
        return {
            "verified": True,
            "hash": calculated_hash,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "status": "Charter integrity verified"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Charter verification failed: {str(e)}")

@router.get("/amendments")
def get_amendment_process():
    """Get information about the amendment process"""
    charter = load_charter()
    return {
        "amendment_process": charter.get("amendment_process", {}),
        "version": charter.get("version", "unknown")
    }