import { NextRequest, NextResponse } from "next/server";

// Proxy to Lab7 OAA to fetch echo messages and filter by trace_id
export async function GET(req: NextRequest) {
  try {
    const traceId = req.nextUrl.searchParams.get("traceId") || "";
    if (!traceId) return NextResponse.json({ items: [] });
    const base = process.env.OAA_API_URL;
    const key = process.env.OAA_API_KEY;
    if (!base || !key) return NextResponse.json({ items: [] });

    // Pull recent echoes; server may paginate—MVP grabs the latest page
    const url = `${base.replace(/\/$/, '')}/oaa/echo/list`;
    const r = await fetch(url, { headers: { "X-API-Key": key } });
    if (!r.ok) return NextResponse.json({ items: [] });
    const j = await r.json();
    // Expect each item like: { content: { text, trace_id? }, ts, actor, ... }
    const items = Array.isArray(j?.items) ? j.items.filter((it: any) => (it?.content?.trace_id === traceId)) : [];
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}