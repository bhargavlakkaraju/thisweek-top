import { NextRequest, NextResponse } from "next/server";
import { sweepExpired, writeWeekSnapshot } from "@/lib/board";
import { currentWeekId, previousWeekId } from "@/lib/week";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Nightly: drop expired seats. Mondays: also freeze the week that just closed
 * to its permanent /week/<id> URL before anything else changes.
 *
 * This is what replaced the destructive Monday wipe. Nothing here deletes a
 * paid seat early, and nothing here loses a week.
 */
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // Vercel Cron signs its own requests; allow those through when unset.
  if (!secret) return req.headers.get("user-agent")?.includes("vercel-cron") ?? false;
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

async function run(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const swept = await sweepExpired();
  const snapshots: string[] = [];

  // Snapshot the week that just closed, then re-stamp the live one so the
  // archive always has an up-to-date copy of the current week too.
  const closing = previousWeekId();
  await writeWeekSnapshot(closing);
  snapshots.push(closing);

  const live = currentWeekId();
  await writeWeekSnapshot(live);
  snapshots.push(live);

  return NextResponse.json({ ok: true, removed: swept.removed, snapshots });
}

export async function GET(req: NextRequest) {
  return run(req);
}
export async function POST(req: NextRequest) {
  return run(req);
}
