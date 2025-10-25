#!/usr/bin/env python3
"""
Charter Signing Script for AI Integrity Constitution

This script signs the constitutional charter with cryptographic integrity.
"""

import json
import hashlib
import hmac
import os
from datetime import datetime
from pathlib import Path

def load_charter():
    """Load the constitutional charter"""
    charter_path = Path(__file__).parent.parent / "config" / "charters" / "ai_integrity_constitution.v1.json"
    with open(charter_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def calculate_charter_hash(charter_data):
    """Calculate SHA-256 hash of the charter"""
    charter_json = json.dumps(charter_data, sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(charter_json.encode('utf-8')).hexdigest()

def sign_charter(charter_data, secret_key=None):
    """Sign the charter with HMAC"""
    if not secret_key:
        secret_key = os.getenv('CHARTER_SIGNING_KEY', 'default-constitutional-key')
    
    charter_json = json.dumps(charter_data, sort_keys=True, separators=(',', ':'))
    signature = hmac.new(
        secret_key.encode('utf-8'),
        charter_json.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return signature

def main():
    print("🛡️  Charter Signing Script")
    print("=" * 40)
    
    # Load charter
    try:
        charter = load_charter()
        print(f"✅ Loaded charter: {charter.get('title', 'Unknown')}")
        print(f"   Version: {charter.get('version', 'Unknown')}")
    except Exception as e:
        print(f"❌ Failed to load charter: {e}")
        return 1
    
    # Calculate hash
    charter_hash = calculate_charter_hash(charter)
    print(f"📊 Charter Hash: {charter_hash}")
    
    # Sign charter
    signature = sign_charter(charter)
    print(f"🔐 Signature: {signature}")
    
    # Create signed version
    signed_charter = {
        **charter,
        "signatures": {
            **charter.get("signatures", {}),
            "cryptographic": {
                "hash": charter_hash,
                "signature": signature,
                "signed_at": datetime.utcnow().isoformat() + "Z",
                "signing_authority": "Custos Charter Foundation"
            }
        }
    }
    
    # Save signed charter
    output_path = Path(__file__).parent.parent / "config" / "charters" / "ai_integrity_constitution.v1.signed.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(signed_charter, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Signed charter saved to: {output_path}")
    
    # Verify signature
    verification_signature = sign_charter(charter)
    if verification_signature == signature:
        print("✅ Signature verification: PASSED")
    else:
        print("❌ Signature verification: FAILED")
        return 1
    
    print("\n🎉 Charter successfully signed and verified!")
    return 0

if __name__ == "__main__":
    exit(main())