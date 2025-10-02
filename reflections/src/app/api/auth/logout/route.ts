import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  const session = await getSession(req, res);
  session.destroy();
  return res;
}
