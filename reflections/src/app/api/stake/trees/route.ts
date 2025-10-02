import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

// POST /api/stake/trees { user, amount }
export async function POST(req: NextRequest) {
  try {
    const { user, amount } = await req.json();
    if (!user || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Missing user or amount" }, { status: 400 });
    }
    const url = `${process.env.GIC_INDEXER_URL}/stake/trees?handle=${encodeURIComponent(user)}&amount=${encodeURIComponent(amount)}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "X-API-Key": process.env.GIC_INDEXER_KEY as string }
    });
    const j = await r.json();
    if (!r.ok) return NextResponse.json(j, { status: r.status });
    return NextResponse.json(j);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "stake failed" }, { status: 500 });
  }
}
