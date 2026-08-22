import { NextRequest, NextResponse } from "next/server";
import { findByListingKey, isSoldOut, readBoard, seatsRemaining } from "@/lib/board";
import { createCheckoutSession } from "@/lib/polar";
import { resolveListingMeta } from "@/lib/resolveListing";
import {
  validateDescription,
  validateDisplayName,
  validateListing,
  validateLogoUrl,
  validateTier,
} from "@/lib/validate";
import { tierRankIndex } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function POST(req: NextRequest) {
  let body: {
    displayName?: string;
    listing?: string;
    logoUrl?: string;
    description?: string;
    tier?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const listing = validateListing(body.listing || "");
  if (!listing.ok) {
    return NextResponse.json({ error: listing.error }, { status: 400 });
  }

  const tierCheck = validateTier(body.tier);
  if (!tierCheck.ok) {
    return NextResponse.json({ error: tierCheck.error }, { status: 400 });
  }
  const tier = tierCheck.tier;

  const state = await readBoard();

  // Fixed price, finite seats. A sold-out band is simply closed until one expires.
  if (isSoldOut(state.entries, tier.id)) {
    return NextResponse.json(
      { error: `The ${tier.label} band is sold out. A seat opens when one expires.` },
      { status: 409 },
    );
  }

  const existing = findByListingKey(state.entries, listing.listingKey);
  if (existing) {
    const sameOrLower = tierRankIndex(tier.id) >= tierRankIndex(existing.tier);
    if (sameOrLower) {
      return NextResponse.json(
        {
          error: `This listing already holds a ${existing.tier === tier.id ? "" : "higher "}seat. Pick a higher band to move up.`,
        },
        { status: 409 },
      );
    }
  }

  let displayName = (body.displayName || "").trim();
  let description = (body.description || "").trim();
  let logoUrl = (body.logoUrl || "").trim();

  if (!displayName || displayName.length < 2 || !description || !logoUrl) {
    const resolved = await resolveListingMeta(listing.listing);
    if (resolved.ok) {
      if (!displayName || displayName.length < 2) displayName = resolved.data.displayName;
      if (!description) description = resolved.data.description;
      if (!logoUrl && resolved.data.logoUrl) logoUrl = resolved.data.logoUrl;
    }
  }

  if (displayName.length < 2) {
    displayName =
      listing.listingType === "handle"
        ? listing.listing
        : (listing.listing.replace(/^https?:\/\//i, "").split("/")[0] || "Product").slice(0, 40);
  }
  if (!description) description = "Paid seat";

  const nameErr = validateDisplayName(displayName);
  if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });

  if (validateLogoUrl(logoUrl || undefined)) logoUrl = "";

  const descCheck = validateDescription(description);
  if (!descCheck.ok) {
    return NextResponse.json({ error: descCheck.error }, { status: 400 });
  }

  const forwarded = req.headers.get("x-forwarded-for");
  const customerIp =
    forwarded?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || undefined;

  try {
    const checkout = await createCheckoutSession({
      chargeCents: tier.price * 100,
      customerIp,
      metadata: {
        displayName,
        listing: listing.listing,
        listingKey: listing.listingKey,
        listingType: listing.listingType,
        logoUrl,
        description: descCheck.description,
        tier: tier.id,
        price: String(tier.price),
        mode: existing ? "upgrade" : "claim",
      },
    });

    return NextResponse.json({
      url: checkout.url,
      checkoutId: checkout.id,
      tier: tier.id,
      tierLabel: tier.label,
      price: tier.price,
      duration: tier.duration,
      seatsLeft: seatsRemaining(state.entries, tier.id),
      mode: existing ? "upgrade" : "claim",
      displayName,
      description: descCheck.description,
      logoUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    console.error("checkout error", err);
    // Public copy stays public-appropriate. The operational detail belongs in
    // the logs and /api/health, not in a message shown to a would-be customer.
    const notConfigured =
      message.includes("POLAR_") || message.includes("not set");

    return NextResponse.json(
      {
        error: notConfigured
          ? "Seats aren't open for purchase just yet. Payments go live shortly - check back very soon."
          : "We couldn't start that checkout. Give it another go in a moment.",
        code: notConfigured ? "payments_not_live" : "checkout_failed",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: notConfigured ? 503 : 502 },
    );
  }
}
