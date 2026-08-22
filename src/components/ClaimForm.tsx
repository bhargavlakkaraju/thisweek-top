"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ActivityEvent, PublicRow } from "@/lib/types";
import { ActivityFeed } from "./ActivityFeed";
import { ClaimBar } from "./ClaimBar";
import { ListingCards } from "./ListingCards";

type Prefill = Partial<{
  displayName: string;
  listing: string;
  logoUrl: string;
  description: string;
  bid: number;
}>;

export function ClaimForm({
  claimOnePrice,
  prefill,
}: {
  claimOnePrice: number;
  prefill?: Prefill;
}) {
  const [displayName, setDisplayName] = useState(prefill?.displayName || "");
  const [listing, setListing] = useState(prefill?.listing || "");
  const [logoUrl, setLogoUrl] = useState(prefill?.logoUrl || "");
  const [description, setDescription] = useState(prefill?.description || "");
  const [bid, setBid] = useState(String(prefill?.bid ?? claimOnePrice ?? 5));
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const bidNum = useMemo(() => Number(bid), [bid]);
  const descLen = description.length;
  const counterClass =
    descLen > 140 ? "over" : descLen >= 120 ? "warn" : "";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setHint(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          listing,
          logoUrl: logoUrl || undefined,
          description,
          bid: bidNum,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed.");
        setLoading(false);
        return;
      }
      if (data.hint) setHint(data.hint);
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Checkout URL missing.");
      setLoading(false);
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <form className="form claim-panel-form" id="claim" onSubmit={onSubmit}>
      <p className="claim-title">
        {prefill?.listing ? "Raise your listing" : "Place a bid"}
      </p>
      <p className="hint" style={{ marginTop: "-0.35rem" }}>
        New listing min $5. Taking #1 needs at least current top + $5.
        Description is required.
      </p>
      <label>
        Display name
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Acme"
          required
          maxLength={40}
        />
      </label>
      <label>
        Product URL or X @handle
        <input
          value={listing}
          onChange={(e) => setListing(e.target.value)}
          placeholder="https://yoursite.com or @you"
          required
        />
      </label>
      <label>
        Logo URL (optional)
        <input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://..."
        />
      </label>
      <label>
        One-line description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 140))}
          placeholder="What you ship in one line (max 140 chars)"
          required
          maxLength={140}
          rows={3}
        />
        <span className={`counter ${counterClass}`.trim()}>
          {descLen}/140
        </span>
      </label>
      <label>
        Bid (USD, whole dollars)
        <input
          type="number"
          min={5}
          step={1}
          value={bid}
          onChange={(e) => setBid(e.target.value)}
          required
        />
        <span className="hint">
          Min $5. This week #1 needs at least ${claimOnePrice}. Raise pays only
          the difference.
        </span>
      </label>
      {error ? <div className="error">{error}</div> : null}
      {hint ? <div className="hint">{hint}</div> : null}
      <button className="btn" type="submit" disabled={loading}>
        {loading
          ? "Starting checkout..."
          : `Pay $${Number.isFinite(bidNum) ? bidNum : "?"} via Polar`}
      </button>
    </form>
  );
}

export function HomeBoard({
  initialEntries,
  claimOnePrice,
  activity,
  resetsAt,
  visitorStub,
  weekLabel,
  topLabel,
}: {
  initialEntries: PublicRow[];
  claimOnePrice: number;
  activity: ActivityEvent[];
  resetsAt: string;
  visitorStub: number;
  weekLabel: string;
  topLabel: string;
}) {
  const [raisePrefill, setRaisePrefill] = useState<Prefill | undefined>();

  function scrollToClaim(prefill?: Prefill) {
    if (prefill) setRaisePrefill(prefill);
    requestAnimationFrame(() => {
      const el = document.getElementById("claim");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <>
      <ClaimBar
        floor={claimOnePrice}
        resetsAt={resetsAt}
        onClaim={(price) => {
          scrollToClaim({ bid: price });
        }}
      />

      <div className="container home-main">
        <section className="hero hero-compact">
          <h1>
            Claim #1 for <em>${claimOnePrice}</em>
          </h1>
          <p className="lead">
            Pay to stand above everyone else this week. Rank is the bid. Board
            resets Monday 00:00 UTC.
          </p>
          <div className="meta-row">
            <span className="dot-live">{topLabel}</span>
            <span className="visitors">
              {visitorStub.toLocaleString("en-US")} visitors this week
            </span>
            <span>{weekLabel}</span>
          </div>
        </section>

        <div className="main-grid" id="board">
          <section>
            <div className="section-head">
              <h2>This week&apos;s board</h2>
              <span className="section-meta">
                {initialEntries.length} listing
                {initialEntries.length === 1 ? "" : "s"} · min $5
              </span>
            </div>
            <ListingCards
              entries={initialEntries}
              onClaimRank={(row) => {
                scrollToClaim({
                  displayName: row.displayName,
                  listing: row.listing,
                  logoUrl: row.logoUrl || "",
                  description: row.description || "",
                  bid: row.claimThisRankPrice,
                });
              }}
            />
          </section>

          <ActivityFeed activity={activity} resetsAt={resetsAt} />
        </div>

        <section className="claim-section">
          <div className="claim-panel">
            <div className="panel-head" style={{ border: "none", padding: 0, background: "transparent", marginBottom: "0.5rem" }}>
              <h2 style={{ textTransform: "none", letterSpacing: "-0.03em", fontSize: "1.15rem", color: "var(--text)" }}>
                {raisePrefill ? "Raise" : "Claim a seat"}
              </h2>
            </div>
            <ClaimForm
              key={JSON.stringify(raisePrefill) + String(claimOnePrice)}
              claimOnePrice={claimOnePrice}
              prefill={raisePrefill}
            />
          </div>
        </section>

        <div className="honesty" id="rules">
          Paid status. Not a quality score. No traffic promises. No forever
          rank. Board clears Monday 00:00 UTC.
        </div>
      </div>
    </>
  );
}
