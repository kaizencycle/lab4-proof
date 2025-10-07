import os, time, requests
from typing import Dict, Any

LAB4 = os.getenv("LAB4_BASE", "https://hive-api-2le8.onrender.com")
BIO = os.getenv("BIOINTEL_SINK_URL", f"{LAB4}/biointel")
LEDGER = os.getenv("LEDGER_API_URL", f"{LAB4}/ledger")
SHIELD = os.getenv("CITIZEN_SHIELD_URL", f"{LAB4}/shield")

def ledger_write(note: str) -> Dict[str, Any]:
    payload = {"note": note, "ts": time.time()}
    try:
        r = requests.post(f"{LEDGER}/attest", json=payload, timeout=10)
        return {"ok": r.ok, "data": r.json() if r.ok else {"error": r.text}}
    except Exception as e:
        return {"ok": False, "error": str(e)}

def shield_check(text: str) -> Dict[str, Any]:
    try:
        r = requests.post(f"{SHIELD}/run", json={"text": text}, timeout=10)
        return {"pass": r.ok, "raw": r.json() if r.ok else {"error": r.text}}
    except Exception as e:
        return {"pass": False, "raw": {"error": str(e)}}

def biointel_anchor(kind: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    body = {"kind": kind, "payload": payload}
    try:
        r = requests.post(f"{BIO}/ingest", json=body, timeout=10)
        r.raise_for_status()
        return {"ok": True, "anchor": r.json()}
    except Exception as e:
        return {"ok": False, "error": str(e), "sent": body}