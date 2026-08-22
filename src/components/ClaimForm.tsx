"use client";

import { useState } from "react";
import type { ActivityEvent, BoardView, PublicRow } from "@/lib/types";
import { track, trackPurchaseIntent } from "@/lib/analytics";
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
  const [reserve, setReserve] = useState<{ tier: string; listing: string } | null>(null);

  function onSelect(tierId: string) {
    setSelected(tierId);
    const t = tiers.find((x) => x.id === tierId);
    track("tier_selected", { tier: tierId, price: t?.price ?? 0 });
  }

  async function onClaim(tierId: string, listingValue: string) {
    setError(null);
    setClaiming(true);
    const tier = tiers.find((t) => t.id === tierId);
    trackPurchaseIntent({
      tier: tierId,
      price: tier?.price ?? 0,
      mode: "claim",
    });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing: listingValue, tier: tierId }),
      });
      const data = await res.json();
      if (!res.ok) {
        track("checkout_blocked", {
          tier: tierId,
          status: res.status,
          reason: (data.error || "unknown").slice(0, 80),
        });
        // Payments not live yet: capture the intent instead of losing the visitor.
        if (data.code === "payments_not_live") {
          setReserve({ tier: tierId, listing: listingValue });
          track("reservation_offered", { tier: tierId });
          return;
        }
        setError(data.error || "Could not start checkout.");
        return;
      }
      if (data.url) {
        track("checkout_started", {
          tier: tierId,
          value: data.price ?? 0,
          currency: "USD",
        });
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
        onSelect={onSelect}
        listing={listing}
        onListingChange={setListing}
        onClaim={onClaim}
        claiming={claiming}
        error={error}
      />

      {reserve ? (
        <ReservePanel
          tier={tiers.find((t) => t.id === reserve.tier)}
          listing={reserve.listing}
          onDismiss={() => setReserve(null)}
        />
      ) : null}

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

function ReservePanel({
  tier,
  listing,
  onDismiss,
}: {
  tier?: BoardView["tiers"][number];
  listing: string;
  onDismiss: () => void;
}) {
  const label = tier?.label ?? "a seat";
  const subject = `Reserve ${label} on 111111.live`;
  const body = [
    `I want to reserve the ${label} rung on 111111.live.`,
    "",
    `Listing: ${listing}`,
    `Band: ${label}${tier ? ` (${tier.duration})` : ""}`,
    "",
    "Email me the moment seats open.",
  ].join("\n");

  const mailto = `mailto:bhargav@hooplaindia.com?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;

  return (
    <section className="reserve-panel" role="status">
      <h2>Seats open in a few hours, not weeks</h2>
      <p>
        Payments are being switched on right now. Reserve the {label} rung and
        you get first refusal on it before the band goes public &mdash; at the
        same price, which never moves.
      </p>
      <p className="reserve-actions">
        <a
          className="btn-claim"
          href={mailto}
          onClick={() =>
            track("reservation_started", {
              tier: tier?.id ?? "unknown",
              price: tier?.price ?? 0,
            })
          }
        >
          Reserve {label}
        </a>
        <button type="button" className="reserve-dismiss" onClick={onDismiss}>
          Not now
        </button>
      </p>
      <p className="reserve-note">
        No card, no account. One email, and your rung is held.
      </p>
    </section>
  );
}
