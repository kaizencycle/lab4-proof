# app/routers/identity.py
from fastapi import APIRouter, HTTPException
from datetime import datetime
import hashlib
import json
from typing import Dict, Any, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["civic"])

# Pydantic models for request/response validation
class IdentityCreateRequest(BaseModel):
    username: str
    dateOfBirth: str
    companion: str

class IdentityCreateResponse(BaseModel):
    identityId: str
    gicWallet: str
    domain: str
    companion: str

class DomainSealRequest(BaseModel):
    identity: str
    config: Dict[str, Any]
    companion: str

class DomainSealResponse(BaseModel):
    hash: str
    timestamp: str

class IntegrityCalculateRequest(BaseModel):
    identityId: str

class IntegrityCalculateResponse(BaseModel):
    score: float

@router.post("/identity/create", response_model=IdentityCreateResponse)
def create_identity(payload: IdentityCreateRequest):
    """Create new civic identity with .gic domain"""
    username = payload.username
    dob = payload.dateOfBirth
    companion = payload.companion
    
    # Validate companion choice
    valid_companions = ["JADE", "EVE", "ZEUS", "HERMES"]
    if companion not in valid_companions:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid companion. Must be one of: {', '.join(valid_companions)}"
        )
    
    # Validate username format
    if not username or len(username) < 2:
        raise HTTPException(
            status_code=400,
            detail="Username must be at least 2 characters long"
        )
    
    # Generate identity ID using username, DOB, and timestamp for uniqueness
    identity_id = hashlib.sha256(
        f"{username}:{dob}:{datetime.utcnow().isoformat()}".encode()
    ).hexdigest()[:16]
    
    # Generate GIC wallet address
    gic_wallet = f"0xGIC{identity_id[:8]}"
    
    # Create domain name
    domain = f"{username}.gic.civic.os"
    
    # TODO: In production, save to database
    # For now, we'll return the generated data
    
    return IdentityCreateResponse(
        identityId=identity_id,
        gicWallet=gic_wallet,
        domain=domain,
        companion=companion
    )

@router.post("/domain/seal", response_model=DomainSealResponse)
def seal_domain(payload: DomainSealRequest):
    """Seal domain configuration to Civic Ledger"""
    # Create attestation record
    attestation = {
        "action": "domain_created",
        "identity": payload.identity,
        "config": payload.config,
        "companion": payload.companion,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Generate cryptographic hash
    digest = hashlib.sha256(
        json.dumps(attestation, sort_keys=True).encode()
    ).hexdigest()
    
    # TODO: In production, POST attestation to Civic Ledger
    # For now, we'll return the hash and timestamp
    
    return DomainSealResponse(
        hash=digest,
        timestamp=attestation["timestamp"]
    )

@router.post("/integrity/calculate", response_model=IntegrityCalculateResponse)
def calculate_integrity(payload: IntegrityCalculateRequest):
    """Calculate GI (Governance Integrity) score for citizen"""
    # For new citizens, start with perfect score
    # In production, this would calculate based on:
    # - M (Memory): Completeness of reflection history
    # - H (Human): User engagement and participation
    # - I (Integrity): Ledger compliance and attestations
    # - E (Ethics): Adherence to Civic Oath principles
    
    # Initial score for new citizens (can be tuned by policy)
    initial_score = 1.0
    
    # TODO: Implement actual GI calculation based on:
    # - Reflection count and quality
    # - Ledger participation
    # - Community engagement
    # - Compliance with Civic Oath
    
    return IntegrityCalculateResponse(score=initial_score)

@router.get("/companions")
def get_companions():
    """Get available companion options for civic identity"""
    return {
        "companions": [
            {
                "id": "JADE",
                "name": "JADE",
                "role": "The Builder",
                "description": "Rationality: 0.95 - Precision and clarity in all endeavors",
                "archetype": "mentor",
                "specialties": ["construction", "analysis", "optimization"]
            },
            {
                "id": "EVE", 
                "name": "EVE",
                "role": "The Reflector", 
                "description": "Empathy: 0.95 - Deep understanding and emotional intelligence",
                "archetype": "sage",
                "specialties": ["reflection", "wisdom", "growth"]
            },
            {
                "id": "ZEUS",
                "name": "ZEUS", 
                "role": "The Arbiter",
                "description": "Balance: 0.88 - Fair judgment and ethical governance",
                "archetype": "guardian",
                "specialties": ["justice", "governance", "ethics"]
            },
            {
                "id": "HERMES",
                "name": "HERMES",
                "role": "The Messenger", 
                "description": "Communication: 0.82 - Clear expression and network connectivity",
                "archetype": "messenger",
                "specialties": ["communication", "networking", "translation"]
            }
        ]
    }

@router.get("/templates")
def get_templates():
    """Get available .gic domain templates"""
    return {
        "templates": [
            {
                "id": "aurora",
                "name": "Aurora",
                "description": "Clean, modern design with focus on content",
                "preview": "/templates/aurora-preview.png",
                "features": ["responsive", "minimal", "fast"]
            },
            {
                "id": "echo",
                "name": "Echo", 
                "description": "Conversational layout optimized for reflections",
                "preview": "/templates/echo-preview.png",
                "features": ["chat-like", "reflection-focused", "companion-integrated"]
            },
            {
                "id": "archive",
                "name": "Archive",
                "description": "Timeline-based design for historical content",
                "preview": "/templates/archive-preview.png", 
                "features": ["chronological", "searchable", "comprehensive"]
            }
        ]
    }
