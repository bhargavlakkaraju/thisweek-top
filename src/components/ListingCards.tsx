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

function Favicon({
  row,
  round,
}: {
  row: PublicRow;
  round?: boolean;
}) {
  const src = row.faviconUrl || row.logoUrl;
  const initials = row.displayName.slice(0, 2).toUpperCase();
  const imgClass = round ? "fav-round" : "list-fav";
  const fbClass = round ? "fav-fallback" : "list-fav-fallback";
  const wrapClass = round ? "fav-wrap" : "list-fav-wrap";

  if (!src) {
    return (
      <div className={wrapClass}>
        <div className={fbClass} aria-hidden>
          {initials}
        </div>
      </div>
    );
  }
  return (
    <div className={wrapClass}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={imgClass}
        src={src}
        alt=""
        width={round ? 38 : 30}
        height={round ? 38 : 30}
        onError={(e) => {
          const img = e.currentTarget;
          img.style.display = "none";
          const fb = img.nextElementSibling as HTMLElement | null;
          if (fb) fb.style.display = "grid";
        }}
      />
      <div className={fbClass} style={{ display: "none" }} aria-hidden>
        {initials}
      </div>
    </div>
  );
}

function FeaturedCard({
  row,
  onClaimRank,
}: {
  row: PublicRow;
  onClaimRank?: (row: PublicRow) => void;
}) {
  const demo = row.isDemo || row.paid === false;
  const ago = timeAgo(row.updatedAt || row.createdAt);
  const isTop = row.rank <= 2;
  const cta = `claim this rank for $${row.claimThisRankPrice}`;

  return (
    <article className={`feat-card${isTop ? " is-top" : ""}`}>
      <div className="rank-badge">#{row.rank}</div>
      <Favicon row={row} round />
      <div className="feat-body">
        <div className="feat-top">
          <div className="feat-name">
            <a
              href={listingHref(row.listing, row.listingType)}
              target="_blank"
              rel="noreferrer"
            >
              {row.displayName}
            </a>
            {demo ? <span className="demo-pill">Demo</span> : null}
          </div>
          <div className="feat-bid">${row.bid.toLocaleString("en-US")}</div>
        </div>
        <div className="feat-desc">{row.description}</div>
        <div className="feat-meta">
          <span>{ago}</span>
          <span className="clicks">
            {(row.clicks ?? 0).toLocaleString("en-US")} clicks
          </span>
        </div>
      </div>
      <div className="feat-bid-col">
        <div className="feat-bid">${row.bid.toLocaleString("en-US")}</div>
      </div>
      <div className="feat-claim">
        {!demo && onClaimRank ? (
          <button
            type="button"
            className="claim-link"
            onClick={() => onClaimRank(row)}
          >
            {cta}
          </button>
        ) : demo ? (
          <span className="hint">Unpaid</span>
        ) : (
          <a className="claim-link" href="#claim">
            {cta}
          </a>
        )}
      </div>
    </article>
  );
}

function ListRow({
  row,
  onClaimRank,
}: {
  row: PublicRow;
  onClaimRank?: (row: PublicRow) => void;
}) {
  const demo = row.isDemo || row.paid === false;
  const ago = timeAgo(row.updatedAt || row.createdAt);
  const cta = `claim this rank for $${row.claimThisRankPrice}`;

  return (
    <article className="list-row">
      <div className="list-rank">#{row.rank}</div>
      <Favicon row={row} />
      <div className="list-body">
        <div className="list-top">
          <div className="list-name">
            <a
              href={listingHref(row.listing, row.listingType)}
              target="_blank"
              rel="noreferrer"
            >
              {row.displayName}
            </a>
            {demo ? <span className="demo-pill">Demo</span> : null}
          </div>
          <div className="list-bid">${row.bid.toLocaleString("en-US")}</div>
        </div>
        <div className="list-desc">{row.description}</div>
        <div className="list-meta">
          <span>{ago}</span>
          <span className="clicks">
            {(row.clicks ?? 0).toLocaleString("en-US")} clicks
          </span>
        </div>
      </div>
      <div className="list-bid-col">
        <div className="list-bid">${row.bid.toLocaleString("en-US")}</div>
      </div>
      <div className="list-claim">
        {!demo && onClaimRank ? (
          <button
            type="button"
            className="claim-link"
            onClick={() => onClaimRank(row)}
          >
            {cta}
          </button>
        ) : demo ? (
          <span className="hint">Unpaid</span>
        ) : (
          <a className="claim-link" href="#claim">
            {cta}
          </a>
        )}
      </div>
    </article>
  );
}

export function ListingCards({
  entries,
  onClaimRank,
  featuredOnly,
  listOnly,
}: {
  entries: PublicRow[];
  onClaimRank?: (row: PublicRow) => void;
  featuredOnly?: boolean;
  listOnly?: boolean;
}) {
  if (entries.length === 0 && !listOnly) {
    return (
      <div className="featured">
        <article className="feat-card empty-card">
          <div className="feat-body" style={{ gridColumn: "1 / -1" }}>
            <div className="feat-name">This week is empty</div>
            <div className="feat-desc">
              Claim #1 for $5. Board resets Monday 00:00 UTC.
            </div>
          </div>
        </article>
      </div>
    );
  }

  const featured = entries.filter((e) => e.rank <= 3);
  const rest = entries.filter((e) => e.rank >= 4);

  if (featuredOnly) {
    return (
      <div className="featured">
        {featured.map((row) => (
          <FeaturedCard key={row.id} row={row} onClaimRank={onClaimRank} />
        ))}
      </div>
    );
  }

  if (listOnly) {
    if (rest.length === 0) return null;
    return (
      <div className="board-list">
        {rest.map((row) => (
          <ListRow key={row.id} row={row} onClaimRank={onClaimRank} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="featured">
        {featured.map((row) => (
          <FeaturedCard key={row.id} row={row} onClaimRank={onClaimRank} />
        ))}
      </div>
      {rest.length > 0 ? (
        <div className="board-list">
          {rest.map((row) => (
            <ListRow key={row.id} row={row} onClaimRank={onClaimRank} />
          ))}
        </div>
      ) : null}
    </>
  );
}

export const BoardCards = ListingCards;
