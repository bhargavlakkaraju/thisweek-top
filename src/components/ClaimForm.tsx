"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ActivityEvent, PublicRow } from "@/lib/types";
import { ActivityFeed } from "./ActivityFeed";
import { HeroClaim } from "./ClaimBar";
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
  const onlineStub = Math.max(12, Math.round(visitorStub / 8.5));

  function scrollToClaim(prefill?: Prefill) {
    if (prefill) setRaisePrefill(prefill);
    requestAnimationFrame(() => {
      const el = document.getElementById("claim");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function claimRank(row: PublicRow) {
    scrollToClaim({
      displayName: row.displayName,
      listing: row.listing,
      logoUrl: row.logoUrl || "",
      description: row.description || "",
      bid: row.claimThisRankPrice,
    });
  }

  return (
    <div className="wrap home-main">
      <HeroClaim
        floor={claimOnePrice}
        resetsAt={resetsAt}
        visitorStub={visitorStub}
        onlineStub={onlineStub}
        topLabel={`${topLabel} · ${weekLabel}`}
        onClaim={(price, listing) => {
          scrollToClaim({
            bid: price,
            listing: listing || undefined,
          });
        }}
      />

      <div id="board">
        <ListingCards
          entries={initialEntries}
          featuredOnly
          onClaimRank={claimRank}
        />
        <ActivityFeed activity={activity} />
        <ListingCards
          entries={initialEntries}
          listOnly
          onClaimRank={claimRank}
        />
      </div>

      <section className="claim-section">
        <div className="claim-panel">
          <ClaimForm
            key={JSON.stringify(raisePrefill) + String(claimOnePrice)}
            claimOnePrice={claimOnePrice}
            prefill={raisePrefill}
          />
        </div>
      </section>

      <div className="honesty" id="rules">
        Paid status. Not a quality score. No traffic promises. No forever rank.
        Board clears Monday 00:00 UTC.
      </div>
    </div>
  );
}
