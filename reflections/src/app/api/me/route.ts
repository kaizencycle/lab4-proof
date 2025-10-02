import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const res = NextResponse.json({});
  const session = await getSession(req, res);
  return NextResponse.json({ handle: session.handle || null });
}
