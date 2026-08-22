import { NextRequest, NextResponse } from "next/server";
import { resolveListingMeta } from "@/lib/resolveListing";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  let body: { listing?: string; url?: string; handle?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const raw = (body.listing || body.url || body.handle || "").trim();
  if (!raw) {
    return NextResponse.json(
      { error: "URL or @handle is required." },
      { status: 400 },
    );
  }

  const resolved = await resolveListingMeta(raw);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }

  const { displayName, description, logoUrl, listing, listingType } =
    resolved.data;
  return NextResponse.json({
    displayName,
    description,
    logoUrl,
    listing,
    listingType,
  });
}

export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("listing") || "").trim();
  if (!raw) {
    return NextResponse.json(
      { error: "listing query param required." },
      { status: 400 },
    );
  }
  const resolved = await resolveListingMeta(raw);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }
  const { displayName, description, logoUrl, listing, listingType } =
    resolved.data;
  return NextResponse.json({
    displayName,
    description,
    logoUrl,
    listing,
    listingType,
  });
}
