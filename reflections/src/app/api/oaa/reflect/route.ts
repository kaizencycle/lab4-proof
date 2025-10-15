import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

function localLesson(text: string) {
  // super-light synthesis so UI never blocks on Lab7
  // 1) extract a topic  2) generate a question  3) offer a tiny challenge
  const t = (text || "").trim();
  const topic = (t.split(/\s+/).slice(0, 6).join(" ") || "today's insight").replace(/[^\w\s\-:,]/g, "");
  const question = `What principle did you apply (or discover) in: "${topic}"?`;
  const challenge = `In one sentence, teach this to a 10-year-old.`;
  return { topic, question, challenge };
}

export async function POST(req: NextRequest) {
  try {
    const { user, text } = await req.json();
    if (!user || !text) return NextResponse.json({ error: "missing user or text" }, { status: 400 });

    // 1) local synthesis (always available)
    const lesson = localLesson(text);
    const traceId = randomUUID();

    // 2) fire-and-forget to Lab7 OAA (if configured)
    const base = process.env.OAA_API_URL;
    const key = process.env.OAA_API_KEY;
    if (base && key) {
      const url = `${base.replace(/\/$/, '')}/oaa/ingest/snapshot`;
      const body = {
        kind: "reflection",
        actor: user,
        content: { text, trace_id: traceId, ...lesson },
        tags: ["apprentice", "reflections", "civic-edu"]
      };
      // don't await; but we'll still try to read response for debugging
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-Key": key },
          body: JSON.stringify(body)
        });
        // ignore response body; OAA stores the snapshot
      } catch {}
    }

    return NextResponse.json({ ok: true, lesson, traceId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "oaa reflect failed" }, { status: 500 });
  }
}