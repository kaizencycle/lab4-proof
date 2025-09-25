# app/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import base64, hmac, hashlib, os, time, typing as T

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory app registry (swap for DB/Redis in production)
APPS: dict[str, dict[str, str]] = {}      # app_id -> {"secret": <base64>}

# -------- helpers --------
def b64(b: bytes) -> str: return base64.b64encode(b).decode()
def b64d(s: str) -> bytes: return base64.b64decode(s.encode())
def hmac_sha256(key: bytes, msg: bytes) -> bytes: return hmac.new(key, msg, hashlib.sha256).digest()

def make_token(app_id: str, secret_b: bytes, ttl: int = 3600) -> tuple[str, int]:
    """Return (token, exp). token = base64(app_id|exp|sig_b64), sig = HMAC(secret, app_id|exp)"""
    exp = int(time.time()) + int(ttl)
    payload = f"{app_id}|{exp}".encode()
    sig_b64 = b64(hmac_sha256(secret_b, payload))
    token = b64(payload + b"|" + sig_b64.encode())
    return token, exp

def parse_token(token: str) -> tuple[str, int, str]:
    """Decode token -> (app_id, exp, sig_b64). Raises ValueError if malformed."""
    raw = b64d(token).decode()
    parts = raw.split("|")
    if len(parts) != 3:
        raise ValueError("malformed token")
    app_id, exp_str, sig_b64 = parts
    return app_id, int(exp_str), sig_b64

def verify_token(token: str) -> bool:
    """Utility verifier (handy for your admin endpoints)."""
    app_id, exp, sig_b64 = parse_token(token)
    if time.time() > exp:
        return False
    meta = APPS.get(app_id)
    if not meta:
        return False
    secret_b = b64d(meta["secret"])
    payload = f"{app_id}|{exp}".encode()
    expected = b64(hmac_sha256(secret_b, payload))
    return hmac.compare_digest(sig_b64, expected)

# -------- models --------
class RegisterApp(BaseModel):
    app_id: str

class IssueToken(BaseModel):
    app_id: str
    nonce: str              # random base64 string from client
    signature: str          # base64(HMAC(secret, nonce))
    ttl: int | None = 3600  # seconds (optional)

class RotateSecret(BaseModel):
    app_id: str
    proof: str              # base64(HMAC(old_secret, "rotate"))

# -------- endpoints --------
@router.post("/register_app")
def register_app(req: RegisterApp):
    """Register an app and mint a base64 secret (dev/prod: keep in DB/secret store)."""
    app_id = req.app_id.strip()
    if not app_id:
        raise HTTPException(400, detail="app_id required")
    # 32 bytes, base64-encoded
    secret = b64(os.urandom(32))
    APPS[app_id] = {"secret": secret}
    return {"app_id": app_id, "secret": secret}

@router.post("/issue_token")
def issue_token(req: IssueToken):
    """Issue a signed token that your Founder Console can verify."""
    meta = APPS.get(req.app_id)
    if not meta:
        raise HTTPException(400, detail="App not registered")

    secret_b = b64d(meta["secret"])

    # verify client proves knowledge of secret (HMAC over nonce)
    expected = b64(hmac_sha256(secret_b, req.nonce.encode()))
    if not hmac.compare_digest(expected, req.signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    token, exp = make_token(req.app_id, secret_b, req.ttl or 3600)
    return {"token": token, "exp": exp}

@router.post("/rotate_secret")
def rotate_secret(req: RotateSecret):
    """Rotate an app's secret using HMAC(old_secret, 'rotate') proof."""
    meta = APPS.get(req.app_id)
    if not meta:
        raise HTTPException(400, detail="App not registered")
    old_secret_b = b64d(meta["secret"])
    expected = b64(hmac_sha256(old_secret_b, b"rotate"))
    if not hmac.compare_digest(expected, req.proof):
        raise HTTPException(401, detail="Invalid proof")
    new_secret = b64(os.urandom(32))
    APPS[req.app_id]["secret"] = new_secret
    return {"app_id": req.app_id, "secret": new_secret}

# (Optional) quick verifier route for debugging; remove if you don't want it public.
@router.post("/verify")
def verify(token: str):
    return {"ok": bool(verify_token(token))}

from fastapi import Depends, Header, Request
import sys

def admin_required(
    request: Request,
    authorization: str = Header(None)
) -> str:
    """
    Dependency to secure admin routes.
    Logs every attempt (success/fail).
    Expects: Authorization: Bearer <token>
    """
    if not authorization or not authorization.startswith("Bearer "):
        print(f"[ADMIN_AUTH][FAIL] Missing token for {request.url}", file=sys.stderr)
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1].strip()

    if not verify_token(token):
        print(f"[ADMIN_AUTH][FAIL] Invalid/expired token for {request.url}", file=sys.stderr)
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    app_id, exp, sig = parse_token(token)
    print(f"[ADMIN_AUTH][OK] app_id={app_id} exp={exp} url={request.url}", file=sys.stderr)
    return app_id

