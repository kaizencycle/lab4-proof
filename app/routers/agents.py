# app/routers/agents.py
import os, logging, httpx
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/agents", tags=["agents"])
log = logging.getLogger("agents")

# Register the companions you expose to the UI
AGENTS = {
    "Jade":   "Strategic Advisor",
    "Eve":    "Wellness Guide",
    "Hermes": "Quick Insights Guide",
    "Zeus":   "Action Coach",
}

# --- Model Router (pluggable targets) ------------------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  # optional
OPENAI_MODEL   = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_URL     = "https://api.openai.com/v1/chat/completions"

# Flip routing order by env (e.g., "self_hosted,openai")
ROUTE_ORDER = [s.strip() for s in os.getenv("MODEL_ROUTE", "openai,self_hosted").split(",") if s.strip()]

async def call_openai(prompt: str, persona: str) -> str:
    if not OPENAI_API_KEY:
        raise RuntimeError("openai_key_missing")
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(
            OPENAI_URL,
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": OPENAI_MODEL,
                "messages": [
                    {"role": "system", "content": f"You are a {persona} in the Reflections ecosystem. Be precise, warm, and concise."},
                    {"role": "user", "content": prompt},
                ],
            },
        )
        j = r.json()
        return j.get("choices", [{}])[0].get("message", {}).get("content") or ""

async def call_self_hosted(prompt: str, persona: str) -> str:
    """
    Stub for your vLLM/TGI endpoint. Replace with your internal URL.
    Example:
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post("https://models.yourdomain.com/generate", json={...})
        return r.json().get("text","")
    """
    raise RuntimeError("self_hosted_not_configured")

async def model_generate(prompt: str, persona: str) -> str:
    """
    Tries providers by ROUTE_ORDER. Falls back on placeholder if all fail.
    """
    errors = []
    for target in ROUTE_ORDER:
        try:
            if target == "openai":
                return await call_openai(prompt, persona)
            elif target == "self_hosted":
                return await call_self_hosted(prompt, persona)
        except Exception as e:
            log.warning("Model '%s' failed: %s", target, e)
            errors.append(f"{target}:{type(e).__name__}")
    raise RuntimeError("all_models_failed: " + ",".join(errors))

# --- Routes ---------------------------------------------------------------

@router.get("/ping")
async def ping():
    return JSONResponse({"status": "ok", "agents": list(AGENTS.keys())})

@router.post("/message/{agent_name}")
async def message_agent(agent_name: str, request: Request):
    if agent_name not in AGENTS:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")

    # Parse JSON safely
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    prompt = (data.get("prompt") or "").strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Missing 'prompt' field")

    persona = AGENTS[agent_name]
    fallback = f"{agent_name} ({persona}) is recalibrating. Please try again in a moment."

    try:
        # Main path: use the model router
        reply = await model_generate(prompt, persona)
        if not reply.strip():
            reply = fallback
        return JSONResponse({"agent": agent_name, "reply": reply, "status": "ok"}, status_code=200)
    except Exception as e:
        log.error("Agent error [%s]: %s", agent_name, e)
        # Fallback, but ALWAYS return JSON
        return JSONResponse({"agent": agent_name, "reply": fallback, "status": "fallback"}, status_code=200)
