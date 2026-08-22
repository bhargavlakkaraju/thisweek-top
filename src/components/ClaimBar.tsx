"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatCountdownShort } from "@/lib/week";

export function HeroClaim({
  floor,
  resetsAt,
  visitorStub,
  onlineStub,
  topLabel,
  listing: listingProp,
  price: priceProp,
  onListingChange,
  onPriceChange,
  onBump,
  bumping,
  error,
}: {
  floor: number;
  resetsAt: string;
  visitorStub: number;
  onlineStub: number;
  topLabel: string;
  listing?: string;
  price?: number;
  onListingChange?: (listing: string) => void;
  onPriceChange?: (price: number) => void;
  onBump: (price: number, listing: string) => void;
  bumping?: boolean;
  error?: string | null;
}) {
  const [price, setPrice] = useState(priceProp ?? floor);
  const [listing, setListing] = useState(listingProp ?? "");
  const [countdown, setCountdown] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setPrice((p) => Math.max(floor, p));
  }, [floor]);

  useEffect(() => {
    if (typeof priceProp === "number" && Number.isFinite(priceProp)) {
      setPrice(Math.max(floor, priceProp));
    }
  }, [priceProp, floor]);

  useEffect(() => {
    if (typeof listingProp === "string") {
      setListing(listingProp);
    }
  }, [listingProp]);

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, new Date(resetsAt).getTime() - Date.now());
      setCountdown(formatCountdownShort(ms));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resetsAt]);

  function updatePrice(next: number) {
    const v = Math.max(floor, next);
    setPrice(v);
    onPriceChange?.(v);
  }

  function updateListing(next: string) {
    setListing(next);
    onListingChange?.(next);
  }

  function submitQuick(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    const trimmed = listing.trim();
    if (!trimmed) {
      setLocalError("Enter a product URL or @handle.");
      return;
    }
    onBump(price, trimmed);
  }

  return (
    <>
      <div className="status-row">
        <div className="status-pill">
          <span className="dot" aria-hidden="true" />
          <span>
            {onlineStub.toLocaleString("en-US")} online ·{" "}
            {visitorStub.toLocaleString("en-US")} visitors this week ·{" "}
            <a href="#board">see board →</a>
          </span>
        </div>
      </div>

      <section className="hero">
        <div className="hero-claim">
          <span className="lead-text">Claim #1 for</span>
          <div className="price-stepper" aria-label="Bid amount stepper">
            <button
              type="button"
              className="step"
              aria-label="Decrease bid"
              disabled={price <= floor || bumping}
              onClick={() => updatePrice(price - 1)}
            >
              −
            </button>
            <span className="big-price">${price}</span>
            <button
              type="button"
              className="step"
              aria-label="Increase bid"
              disabled={bumping}
              onClick={() => updatePrice(price + 1)}
            >
              +
            </button>
          </div>
        </div>
        <p className="hero-sub">
          New spots start at $5. Paying less than the #1 price still puts you on
          the board at whatever place that bid can take.
        </p>
        <p className="hero-reset">
          Resets Monday 00:00 UTC · <strong>{countdown}</strong>
        </p>
        <p className="hero-top-quiet">{topLabel}</p>
      </section>

      <section className="claim-strip" id="claim-top">
        <form className="claim-strip-inner" onSubmit={submitQuick} id="claim">
          <label className="claim-input">
            <span className="globe" aria-hidden="true">
              ◎
            </span>
            <input
              type="text"
              value={listing}
              onChange={(e) => updateListing(e.target.value)}
              placeholder="Your product URL or @handle"
              autoComplete="off"
              disabled={bumping}
              required
            />
          </label>
          <button type="submit" className="btn-outbid" disabled={bumping}>
            {bumping ? "Starting..." : "Bump"}
          </button>
        </form>
        <p className="claim-note">
          Already on the list? Enter the same URL or @handle and raise your bid.
          Logo pulls from the page automatically.
        </p>
        {localError || error ? (
          <p className="error strip-error">{localError || error}</p>
        ) : null}
      </section>
    </>
  );
}

/** @deprecated use HeroClaim - kept for import compatibility */
export const ClaimBar = HeroClaim;
