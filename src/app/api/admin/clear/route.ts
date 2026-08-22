import { NextRequest, NextResponse } from "next/server";
import { clearBoard, publicBoardView, readBoard } from "@/lib/board";

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

/** Removes every row, including the seeded placeholders. Irreversible. */
export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "ADMIN_SECRET is not configured." }, { status: 503 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const before = await readBoard();
  const count = before.entries.length;
  await clearBoard();
  return NextResponse.json({
    ok: true,
    removed: count,
    board: publicBoardView(await readBoard()),
  });
}
