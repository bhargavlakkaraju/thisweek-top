import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { publicBoardView, readBoard, writeBoard } from "@/lib/board";
import { expiryFor, getTier } from "@/lib/constants";
import type { BoardEntry } from "@/lib/types";
import { currentWeekId } from "@/lib/week";

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

const DEMOS: Array<{ name: string; listing: string; key: string; tier: string; desc: string }> = [
  { name: "NovaStack", listing: "https://novastack.dev", key: "url:novastack.dev", tier: "t1111", desc: "Ship backend infra without the ops tax." },
  { name: "PixelForge", listing: "@pixelforge", key: "handle:pixelforge", tier: "t111", desc: "Design systems that stay on brand." },
  { name: "QuietOps", listing: "https://quietops.io", key: "url:quietops.io", tier: "t111", desc: "Incident response without the pager panic." },
  { name: "CopperWire", listing: "@copperwire", key: "handle:copperwire", tier: "t11", desc: "Hardware notes and tinkering in public." },
  { name: "DeskLamp Co", listing: "https://desklamp.co", key: "url:desklamp.co", tier: "t1", desc: "Warm desk light for late shipping nights." },
];

/**
 * Development only. Every row is flagged demo:true so it renders with a Demo
 * badge and is excluded from the paid totals. Never run this on production.
 */
export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "ADMIN_SECRET is not configured." }, { status: 503 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const now = new Date();
  const entries: BoardEntry[] = DEMOS.map((d, i) => {
    const tier = getTier(d.tier)!;
    const at = new Date(now.getTime() - (DEMOS.length - i) * 60_000).toISOString();
    return {
      id: randomUUID(),
      displayName: d.name,
      listing: d.listing,
      listingKey: d.key,
      listingType: d.listing.startsWith("@") ? "handle" : "url",
      description: d.desc,
      tier: tier.id,
      price: tier.price,
      paid: true,
      demo: true,
      createdAt: at,
      updatedAt: at,
      expiresAt: expiryFor(tier, now),
      clicks: 0,
    };
  });

  await writeBoard({
    weekId: currentWeekId(),
    entries,
    activity: [],
    updatedAt: now.toISOString(),
  });

  return NextResponse.json({
    ok: true,
    count: entries.length,
    note: "Seeded demo rows, all flagged demo:true. Clear them with POST /api/admin/clear before launch.",
    board: publicBoardView(await readBoard()),
  });
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(publicBoardView(await readBoard()));
}
