import { NextRequest, NextResponse } from "next/server";
import {
  claimPriceForTop,
  findByListingKey,
  readBoard,
  topBid,
} from "@/lib/board";
import { MIN_BID, TOP_BUMP } from "@/lib/constants";
import { createCheckoutSession } from "@/lib/polar";
import {
  validateBidAmount,
  validateDescription,
  validateDisplayName,
  validateListing,
  validateLogoUrl,
} from "@/lib/validate";

export const dynamic = "force-dynamic";

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

  const nameErr = validateDisplayName(body.displayName || "");
  if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });

  const listing = validateListing(body.listing || "");
  if (!listing.ok) {
    return NextResponse.json({ error: listing.error }, { status: 400 });
  }

  const logoErr = validateLogoUrl(body.logoUrl);
  if (logoErr) return NextResponse.json({ error: logoErr }, { status: 400 });

  const descCheck = validateDescription(body.description || "");
  if (!descCheck.ok) {
    return NextResponse.json({ error: descCheck.error }, { status: 400 });
  }

  const bidCheck = validateBidAmount(body.bid);
  if (!bidCheck.ok) {
    return NextResponse.json({ error: bidCheck.error }, { status: 400 });
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
        displayName: (body.displayName || "").trim(),
        listing: listing.listing,
        listingKey: listing.listingKey,
        listingType: listing.listingType,
        logoUrl: (body.logoUrl || "").trim(),
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
