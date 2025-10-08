# app/routers/agents.py
import os, httpx, logging
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/agents", tags=["agents"])
log = logging.getLogger("agents")

AGENTS = {
    "Jade": "Strategic Advisor",
    "Eve": "Wellness Guide",
    "Hermes": "Quick Insights Guide",
    "Zeus": "Action Coach",
}

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_URL = "https://api.openai.com/v1/chat/completions"


@router.get("/ping")
async def ping():
    return JSONResponse({"status": "ok", "agents": list(AGENTS.keys())})


@router.post("/message/{agent_name}")
async def message_agent(agent_name: str, request: Request):
    """Main endpoint for Reflections chat."""
    if agent_name not in AGENTS:
        return JSONResponse(
            {"error": "not_found", "detail": f"Agent '{agent_name}' not found"}, status_code=404
        )

    # Parse JSON safely
    try:
        payload = await request.json()
    except Exception:
        return JSONResponse({"error": "invalid_json"}, status_code=400)

    prompt = (payload.get("prompt") or "").strip()
    if not prompt:
        return JSONResponse({"error": "missing_prompt"}, status_code=400)

    persona = AGENTS[agent_name]
    fallback = f"{agent_name} ({persona}) is recalibrating. Please try again later."

    # If no key configured, just echo
    if not OPENAI_API_KEY:
        return JSONResponse(
            {"agent": agent_name, "reply": fallback, "status": "no_key"}, status_code=200
        )

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                OPENAI_URL,
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": OPENAI_MODEL,
                    "messages": [
                        {"role": "system", "content": f"You are {persona}."},
                        {"role": "user", "content": prompt},
                    ],
                },
            )
        data = r.json()
        reply = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
        if not reply:
            reply = fallback
        return JSONResponse(
            {"agent": agent_name, "reply": reply, "status": "ok"}, status_code=200
        )

    except Exception as e:
        log.error("Agent error [%s]: %s", agent_name, e)
        # Always return valid JSON, even on failure
        return JSONResponse(
            {"agent": agent_name, "reply": fallback, "status": "fallback"},
            status_code=200,
        )
