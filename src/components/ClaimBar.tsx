"use client";

import { FormEvent, useState } from "react";
import type { TierAvailability } from "@/lib/types";

function seatLine(t: TierAvailability): string {
  if (t.seats == null) return "unlimited seats";
  if (t.soldOut) return "sold out";
  return `${t.remaining!.toLocaleString("en-US")} of ${t.seats.toLocaleString("en-US")} left`;
}

export function HeroLadder({
  tiers,
  selected,
  onSelect,
  listing,
  onListingChange,
  onClaim,
  claiming,
  error,
}: {
  tiers: TierAvailability[];
  selected: string;
  onSelect: (id: string) => void;
  listing: string;
  onListingChange: (v: string) => void;
  onClaim: (tierId: string, listing: string) => void;
  claiming?: boolean;
  error?: string | null;
}) {
  const [localError, setLocalError] = useState<string | null>(null);
  const active = tiers.find((t) => t.id === selected) ?? tiers[tiers.length - 1];

  function submit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    const trimmed = listing.trim();
    if (!trimmed) {
      setLocalError("Enter a product URL or @handle.");
      return;
    }
    if (active.soldOut) {
      setLocalError(`The ${active.label} band is sold out. Pick another.`);
      return;
    }
    onClaim(active.id, trimmed);
  }

  return (
    <>
      <section className="hero">
        <p className="hero-eyebrow">The domain is the price list.</p>
        <h1 className="hero-title">
          <span className="ones">1</span>
          <span className="ones">11</span>
          <span className="ones">111</span>
          <span className="ones">1,111</span>
          <span className="ones">11,111</span>
          <span className="ones accent">111,111</span>
        </h1>
        <p className="hero-sub">
          Six prices. Six terms. Pay once and the rung is yours until it runs
          out &mdash; there is no bidding, and nobody can outbid you off it at
          three in the morning. Seats are finite: when a band fills it stays shut
          until somebody&apos;s term expires.
        </p>
      </section>

      <section className="ladder" id="ladder" aria-label="Pick a tier">
        {tiers.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tier-card${t.id === active.id ? " is-selected" : ""}${t.soldOut ? " is-sold-out" : ""}`}
            onClick={() => !t.soldOut && onSelect(t.id)}
            aria-pressed={t.id === active.id}
            disabled={t.soldOut}
          >
            <span className="tier-price">{t.label}</span>
            <span className="tier-duration">{t.duration}</span>
            <span className={`tier-seats${t.soldOut ? " sold" : ""}`}>{seatLine(t)}</span>
          </button>
        ))}
      </section>

      <section className="claim-strip" id="claim">
        <form className="claim-strip-inner" onSubmit={submit}>
          <label className="claim-input">
            <span className="globe" aria-hidden="true">
              &#9678;
            </span>
            <input
              type="text"
              value={listing}
              onChange={(e) => onListingChange(e.target.value)}
              placeholder="Your product URL or @handle"
              autoComplete="off"
              disabled={claiming}
              required
            />
          </label>
          <button type="submit" className="btn-claim" disabled={claiming || active.soldOut}>
            {claiming ? "Starting..." : `Take a ${active.label} seat`}
          </button>
        </form>
        <p className="claim-note">
          {active.label} buys {active.duration} on the board.{" "}
          {active.seats == null
            ? "This band never fills."
            : `${active.remaining!.toLocaleString("en-US")} of ${active.seats.toLocaleString("en-US")} seats are open.`}{" "}
          Your name, blurb and logo are read from the page you enter.
        </p>
        {localError || error ? (
          <p className="error strip-error">{localError || error}</p>
        ) : null}
      </section>
    </>
  );
}

export const HeroClaim = HeroLadder;
export const ClaimBar = HeroLadder;
