import { NextRequest, NextResponse } from "next/server";
import {
  claimPriceForTop,
  findByListingKey,
  readBoard,
  topBid,
} from "@/lib/board";
import { MIN_BID, TOP_BUMP } from "@/lib/constants";
import { createCheckoutSession } from "@/lib/polar";
import { resolveListingMeta } from "@/lib/resolveListing";
import {
  validateBidAmount,
  validateDescription,
  validateDisplayName,
  validateListing,
  validateLogoUrl,
} from "@/lib/validate";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function POST(req: NextRequest) {
  let body: {
    displayName?: string;
    listing?: string;
    logoUrl?: string;
    description?: string;
    bid?: number;
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

  const bidCheck = validateBidAmount(body.bid);
  if (!bidCheck.ok) {
    return NextResponse.json({ error: bidCheck.error }, { status: 400 });
  }

  let displayName = (body.displayName || "").trim();
  let description = (body.description || "").trim();
  let logoUrl = (body.logoUrl || "").trim();

  const needsResolve =
    !displayName ||
    displayName.length < 2 ||
    !description ||
    !logoUrl;

  if (needsResolve) {
    const resolved = await resolveListingMeta(listing.listing);
    if (resolved.ok) {
      if (!displayName || displayName.length < 2) {
        displayName = resolved.data.displayName;
      }
      if (!description) {
        description = resolved.data.description;
      }
      if (!logoUrl && resolved.data.logoUrl) {
        logoUrl = resolved.data.logoUrl;
      }
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

  const logoErr = validateLogoUrl(logoUrl || undefined);
  if (logoErr) {
    // Bad auto logo (data: URIs etc.) - drop and continue; board uses letter/favicon fallback.
    logoUrl = "";
  }

  const descCheck = validateDescription(description);
  if (!descCheck.ok) {
    return NextResponse.json({ error: descCheck.error }, { status: 400 });
  }

  const state = await readBoard();
  const existing = findByListingKey(state.entries, listing.listingKey);
  const bid = bidCheck.bid;

  let chargeAmount: number;
  let mode: "claim" | "raise";

  if (existing) {
    if (bid <= existing.bid) {
      return NextResponse.json(
        { error: `Raise must beat your current bid of $${existing.bid}.` },
        { status: 400 },
      );
    }
    chargeAmount = bid - existing.bid;
    mode = "raise";
  } else {
    if (bid < MIN_BID) {
      return NextResponse.json(
        { error: `Minimum bid is $${MIN_BID}.` },
        { status: 400 },
      );
    }
    chargeAmount = bid;
    mode = "claim";
  }

  if (chargeAmount < 1) {
    return NextResponse.json({ error: "Nothing to charge." }, { status: 400 });
  }

  const top = topBid(state.entries);
  const needForOne = claimPriceForTop(state.entries);

  const forwarded = req.headers.get("x-forwarded-for");
  const customerIp =
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    undefined;

  try {
    const checkout = await createCheckoutSession({
      chargeCents: chargeAmount * 100,
      customerIp,
      metadata: {
        displayName,
        listing: listing.listing,
        listingKey: listing.listingKey,
        listingType: listing.listingType,
        logoUrl,
        description: descCheck.description,
        bid: String(bid),
        chargeAmount: String(chargeAmount),
        mode,
      },
    });

    return NextResponse.json({
      url: checkout.url,
      checkoutId: checkout.id,
      chargeAmount,
      bid,
      mode,
      displayName,
      description: descCheck.description,
      logoUrl,
      hint:
        bid < needForOne
          ? `This bid will not take #1. #1 needs at least $${needForOne} (top $${top} + $${TOP_BUMP}).`
          : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    console.error("checkout error", err);
    return NextResponse.json(
      {
        error:
          message.includes("POLAR_") || message.includes("not set")
            ? "Payments are not configured yet. Set Polar env vars."
            : "Could not start checkout. Try again.",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 502 },
    );
  }
}
