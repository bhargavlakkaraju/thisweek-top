"use client";

import { useState } from "react";
import type { ActivityEvent, BoardView, PublicRow } from "@/lib/types";
import { ActivityFeed } from "./ActivityFeed";
import { HeroLadder } from "./ClaimBar";
import { ListingCards } from "./ListingCards";

export function HomeBoard({
  entries,
  activity,
  tiers,
  totals,
}: {
  entries: PublicRow[];
  activity: ActivityEvent[];
  tiers: BoardView["tiers"];
  totals: BoardView["totals"];
}) {
  const firstOpen = tiers.slice().reverse().find((t) => !t.soldOut) ?? tiers[tiers.length - 1];
  const [listing, setListing] = useState("");
  const [selected, setSelected] = useState(firstOpen.id as string);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClaim(tierId: string, listingValue: string) {
    setError(null);
    setClaiming(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing: listingValue, tier: tierId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start checkout.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Checkout did not return a payment link.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="wrap">
      <HeroLadder
        tiers={tiers}
        selected={selected}
        onSelect={setSelected}
        listing={listing}
        onListingChange={setListing}
        onClaim={onClaim}
        claiming={claiming}
        error={error}
      />

      <section className="totals-bar" aria-label="Board totals">
        <span>
          <strong>{totals.listings.toLocaleString("en-US")}</strong> listings live
        </span>
        <span>
          <strong>{totals.clicks.toLocaleString("en-US")}</strong> clicks sent
        </span>
        <span>
          <strong>${totals.committed.toLocaleString("en-US")}</strong> on the board
        </span>
        <a href="/stats">all stats &rarr;</a>
      </section>

      <section id="board">
        <ListingCards
          entries={entries}
          activitySlot={<ActivityFeed activity={activity} />}
        />
      </section>

      <p className="honesty">
        Paid placement. Not a quality score, not an endorsement, and no promise of
        traffic. Every click number on this page is measured, never estimated.
      </p>
    </div>
  );
}
