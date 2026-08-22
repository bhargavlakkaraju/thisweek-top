import { NextRequest, NextResponse } from "next/server";
import { readBoard, recordClick } from "@/lib/board";

export const dynamic = "force-dynamic";

/**
 * Counted outbound redirect. Clicks are measured, never invented — the number
 * on a card is the number of people who actually went through this route.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const state = await readBoard();
  const entry = state.entries.find((e) => e.id === id);
  if (!entry) {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  await recordClick(id).catch((err) => console.error("click record failed", err));

  const target =
    entry.listingType === "handle"
      ? `https://x.com/${entry.listing.replace(/^@/, "")}`
      : entry.listing;

  return NextResponse.redirect(target, 302);
}
