"use client";

import { FormEvent, useMemo, useState } from "react";
import { BoardTable, type PublicRow } from "./BoardTable";

type Prefill = Partial<{
  displayName: string;
  listing: string;
  logoUrl: string;
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
  const [bid, setBid] = useState(String(prefill?.bid ?? claimOnePrice ?? 5));
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const bidNum = useMemo(() => Number(bid), [bid]);

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
    <form className="form" id="claim" onSubmit={onSubmit}>
      <p className="claim-title">
        {prefill ? "Raise your listing" : `Claim #1 for $${claimOnePrice}`}
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
}: {
  initialEntries: PublicRow[];
  claimOnePrice: number;
}) {
  const [raisePrefill, setRaisePrefill] = useState<Prefill | undefined>();

  return (
    <div className="grid-2">
      <section className="panel">
        <div className="panel-head">
          <h2>This week&apos;s board</h2>
          <span className="hint">Paid seats only</span>
        </div>
        <BoardTable
          entries={initialEntries}
          onRaise={(row: PublicRow) => {
            setRaisePrefill({
              displayName: row.displayName,
              listing: row.listing,
              logoUrl: row.logoUrl || "",
              bid: row.bid + 5,
            });
            const el = document.getElementById("claim");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      </section>
      <section className="panel">
        <div className="panel-head">
          <h2>{raisePrefill ? "Raise" : "Claim a seat"}</h2>
        </div>
        <ClaimForm
          key={JSON.stringify(raisePrefill) + String(claimOnePrice)}
          claimOnePrice={claimOnePrice}
          prefill={raisePrefill}
        />
      </section>
    </div>
  );
}
