import { NextRequest, NextResponse } from "next/server";
import { publicBoardView, readBoard, seedDemoUnpaid } from "@/lib/board";

export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const header = req.headers.get("x-admin-secret") || "";
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const key = req.nextUrl.searchParams.get("key") || "";
  return header === secret || bearer === secret || key === secret;
}

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { error: "ADMIN_SECRET is not configured." },
      { status: 503 },
    );
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const entries = await seedDemoUnpaid();
  return NextResponse.json({
    ok: true,
    count: entries.length,
    note: "Seeded 5 DEMO unpaid rows (visible on board, marked Demo, not paid).",
    entries: entries.map((e) => ({
      id: e.id,
      displayName: e.displayName,
      listing: e.listing,
      bid: e.bid,
      paid: e.paid,
    })),
  });
}

export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { error: "ADMIN_SECRET is not configured." },
      { status: 503 },
    );
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const state = await readBoard();
  return NextResponse.json(publicBoardView(state));
}
