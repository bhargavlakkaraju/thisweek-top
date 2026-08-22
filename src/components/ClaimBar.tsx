"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatCountdownShort } from "@/lib/week";

export function HeroClaim({
  floor,
  resetsAt,
  visitorStub,
  onlineStub,
  topLabel,
  onClaim,
}: {
  floor: number;
  resetsAt: string;
  visitorStub: number;
  onlineStub: number;
  topLabel: string;
  onClaim: (price: number, listing?: string) => void;
}) {
  const [price, setPrice] = useState(floor);
  const [listing, setListing] = useState("");
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    setPrice((p) => Math.max(floor, p));
  }, [floor]);

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, new Date(resetsAt).getTime() - Date.now());
      setCountdown(formatCountdownShort(ms));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resetsAt]);

  function submitQuick(e: FormEvent) {
    e.preventDefault();
    onClaim(price, listing.trim() || undefined);
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
              disabled={price <= floor}
              onClick={() => setPrice((p) => Math.max(floor, p - 1))}
            >
              −
            </button>
            <span className="big-price">${price}</span>
            <button
              type="button"
              className="step"
              aria-label="Increase bid"
              onClick={() => setPrice((p) => p + 1)}
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
        <form className="claim-strip-inner" onSubmit={submitQuick}>
          <label className="claim-input">
            <span className="globe" aria-hidden="true">
              ◎
            </span>
            <input
              type="text"
              value={listing}
              onChange={(e) => setListing(e.target.value)}
              placeholder="Your product URL or @handle"
              autoComplete="off"
            />
          </label>
          <button type="submit" className="btn-outbid">
            Claim
          </button>
        </form>
        <p className="claim-note">
          Already on the list? Enter the same URL or @handle and raise your bid.
          Description required on the full form below.
        </p>
      </section>
    </>
  );
}

/** @deprecated use HeroClaim — kept for import compatibility */
export const ClaimBar = HeroClaim;
