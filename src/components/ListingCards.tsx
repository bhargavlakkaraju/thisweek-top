"use client";

import type { PublicRow } from "@/lib/types";
import { timeAgo } from "@/lib/timeAgo";

function listingHref(listing: string, type: "url" | "handle") {
  if (type === "handle") {
    const handle = listing.replace(/^@/, "");
    return `https://x.com/${handle}`;
  }
  return listing;
}

function Favicon({ row }: { row: PublicRow }) {
  const src = row.faviconUrl || row.logoUrl;
  const initials = row.displayName.slice(0, 2).toUpperCase();
  if (!src) {
    return (
      <div className="fav-wrap">
        <div className="fav-fallback" aria-hidden>
          {initials}
        </div>
      </div>
    );
  }
  return (
    <div className="fav-wrap">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="fav"
        src={src}
        alt=""
        width={30}
        height={30}
        onError={(e) => {
          const img = e.currentTarget;
          img.style.display = "none";
          const fb = img.nextElementSibling as HTMLElement | null;
          if (fb) fb.style.display = "grid";
        }}
      />
      <div className="fav-fallback" style={{ display: "none" }} aria-hidden>
        {initials}
      </div>
    </div>
  );
}

export function ListingCards({
  entries,
  onClaimRank,
}: {
  entries: PublicRow[];
  onClaimRank?: (row: PublicRow) => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="cards">
        <article className="listing-card empty-card">
          <div className="identity" style={{ gridColumn: "1 / -1" }}>
            <div className="name">This week is empty</div>
            <div className="desc">
              Claim #1 for $5. Board resets Monday 00:00 UTC.
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="cards">
      {entries.map((row) => {
        const demo = row.isDemo || row.paid === false;
        const ago = timeAgo(row.updatedAt || row.createdAt);
        const cta =
          row.rank === 1
            ? `Raise · $${row.claimThisRankPrice}`
            : `Claim this rank · $${row.claimThisRankPrice}`;
        return (
          <article
            key={row.id}
            className={`listing-card${row.rank === 1 ? " is-top" : ""}`}
          >
            <div className="rank">#{row.rank}</div>
            <Favicon row={row} />
            <div className="identity">
              <div className="name">
                {row.displayName}
                {demo ? <span className="demo-pill">Demo</span> : null}
              </div>
              <a
                className="handle"
                href={listingHref(row.listing, row.listingType)}
                target="_blank"
                rel="noreferrer"
              >
                {row.listing}
              </a>
              <div className="desc">{row.description}</div>
            </div>
            <div className="bid-col">
              <div className="amount">${row.bid}</div>
            </div>
            <div className="meta-col">{ago}</div>
            <div className="cta-col">
              {!demo && onClaimRank ? (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-coral"
                  onClick={() => onClaimRank(row)}
                >
                  {cta}
                </button>
              ) : demo ? (
                <span className="hint">Unpaid</span>
              ) : (
                <a className="btn btn-sm btn-outline-coral" href="#claim">
                  {cta}
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
