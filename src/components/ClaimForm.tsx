"use client";

import { useEffect, useState } from "react";
import type { ActivityEvent, PublicRow } from "@/lib/types";
import { ActivityFeed } from "./ActivityFeed";
import { HeroClaim } from "./ClaimBar";
import { ListingCards } from "./ListingCards";

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
  const [listing, setListing] = useState("");
  const [price, setPrice] = useState(claimOnePrice);
  const [bumping, setBumping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  void weekLabel;

  useEffect(() => {
    setPrice((p) => Math.max(claimOnePrice, p));
  }, [claimOnePrice]);

  function bumpRank(row: PublicRow) {
    setListing(row.listing);
    setPrice(row.claimThisRankPrice);
    setError(null);
    requestAnimationFrame(() => {
      const el = document.getElementById("claim-top");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      const input = el?.querySelector("input");
      if (input instanceof HTMLInputElement) input.focus();
    });
  }

  async function onBump(bid: number, listingValue: string) {
    setError(null);
    setBumping(true);
    try {
      let displayName: string | undefined;
      let description: string | undefined;
      let logoUrl: string | undefined;

      try {
        const resolveRes = await fetch("/api/resolve-listing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listing: listingValue }),
        });
        const resolved = await resolveRes.json();
        if (resolveRes.ok) {
          displayName = resolved.displayName;
          description = resolved.description || "Paid seat";
          logoUrl = resolved.logoUrl || undefined;
        } else if (resolved.error) {
          setError(resolved.error);
          setBumping(false);
          return;
        }
      } catch {
        // Checkout auto-resolves server-side if client resolve fails.
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing: listingValue,
          bid,
          displayName,
          description: description || "Paid seat",
          logoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed.");
        setBumping(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Checkout URL missing.");
      setBumping(false);
    } catch {
      setError("Network error. Try again.");
      setBumping(false);
    }
  }

  return (
    <div className="wrap home-main">
      <HeroClaim
        floor={claimOnePrice}
        resetsAt={resetsAt}
        visitorStub={visitorStub}
        onlineStub={37}
        topLabel={topLabel}
        listing={listing}
        price={price}
        onListingChange={setListing}
        onPriceChange={setPrice}
        onBump={onBump}
        bumping={bumping}
        error={error}
      />

      <div id="board">
        <ListingCards
          entries={initialEntries}
          onClaimRank={bumpRank}
          activitySlot={<ActivityFeed activity={activity} />}
        />
      </div>

      <div className="honesty" id="rules">
        Paid status. Not a quality score. No traffic promises. No forever rank.
        Board clears Monday 00:00 UTC.
      </div>
    </div>
  );
}

/** Kept for import compatibility - homepage no longer shows the long bid form. */
export function ClaimForm(_props: {
  claimOnePrice: number;
  prefill?: Partial<{
    displayName: string;
    listing: string;
    logoUrl: string;
    description: string;
    bid: number;
  }>;
}) {
  return null;
}
