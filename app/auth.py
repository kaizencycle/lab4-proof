# app/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import base64, hmac, hashlib, os, time

router = APIRouter(prefix="/auth", tags=["auth"])

# in-memory app registry (later swap with DB/Redis if needed)
apps = {}

# ---- Models ----
class RegisterApp(BaseModel):
    app_id: str

class IssueToken(BaseModel):
    app_id: str
    nonce: str
    signature: str

# ---- Endpoints ----
@router.post("/register_app")
def register_app(req: RegisterApp):
    """Register a new app and issue a secret"""
    secret = base64.b64encode(os.urandom(32)).decode()
    apps[req.app_id] = {"secret": secret}
    return {"app_id": req.app_id, "secret": secret}

@router.post("/issue_token")
def issue_token(req: IssueToken):
    """Issue a short-lived admin token"""
    app = apps.get(req.app_id)
    if not app:
        raise HTTPException(status_code=400, detail="App not registered")

    # Verify signature
    secret = base64.b64decode(app["secret"].encode())
    expected = hmac.new(secret, req.nonce.encode(), hashlib.sha256).digest()
    expected_b64 = base64.b64encode(expected).decode()

    if req.signature != expected_b64:
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Mint token (you can replace with JWT later)
    token = base64.b64encode(f"{req.app_id}:{int(time.time())}".encode()).decode()

    return {"token": token}  
