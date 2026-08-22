"use client";

import type { ReactNode } from "react";
import type { PublicRow } from "@/lib/types";
import { track } from "@/lib/analytics";
import { timeAgo } from "@/lib/timeAgo";

/** All outbound clicks route through the counter so the number stays honest. */
export function clickHref(row: PublicRow): string {
  return `/api/click/${row.id}`;
}

function expiryLine(row: PublicRow): string {
  if (!row.expiresAt) return "permanent";
  const ms = new Date(row.expiresAt).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days}d left`;
  const hours = Math.max(1, Math.floor(ms / 3_600_000));
  return `${hours}h left`;
}

function Favicon({ row, round }: { row: PublicRow; round?: boolean }) {
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

function Row({ row, featured }: { row: PublicRow; featured?: boolean }) {
  const ago = timeAgo(row.updatedAt || row.createdAt);
  const isTop = row.rank <= 2;

  return (
    <article
      className={
        featured ? `feat-card${isTop ? " is-top" : ""}` : "list-row"
      }
    >
      <div className={featured ? "rank-badge" : "list-rank"}>#{row.rank}</div>
      <Favicon row={row} round={featured} />
      <div className={featured ? "feat-body" : "list-body"}>
        <div className={featured ? "feat-top" : "list-top"}>
          <div className={featured ? "feat-name" : "list-name"}>
            <a
              href={clickHref(row)}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() =>
                track("listing_click", {
                  listing: row.listingKey,
                  rank: row.rank,
                  tier: row.tier,
                })
              }
            >
              {row.displayName}
            </a>
            <span className="tier-pill">{row.tierLabel}</span>
            {row.isDemo ? <span className="demo-pill">Demo</span> : null}
          </div>
        </div>
        <div className={featured ? "feat-desc" : "list-desc"}>{row.description}</div>
        <div className={featured ? "feat-meta" : "list-meta"}>
          <span>{ago}</span>
          <span className="clicks">{row.clicks.toLocaleString("en-US")} clicks</span>
          <span className="expiry">{expiryLine(row)}</span>
        </div>
      </div>
      <div className={featured ? "feat-bid-col" : "list-bid-col"}>
        <div className={featured ? "feat-bid" : "list-bid"}>
          ${row.price.toLocaleString("en-US")}
        </div>
      </div>
    </article>
  );
}

export function ListingCards({
  entries,
  activitySlot,
}: {
  entries: PublicRow[];
  activitySlot?: ReactNode;
}) {
  if (entries.length === 0) {
    return (
      <>
        <div className="featured">
          <article className="feat-card empty-card">
            <div className="feat-body" style={{ gridColumn: "1 / -1" }}>
              <div className="feat-name">The board is open</div>
              <div className="feat-desc">
                Every band is empty. A $1 seat puts you on it for a day; $11 holds
                a week.
              </div>
            </div>
          </article>
        </div>
        {activitySlot}
      </>
    );
  }

  const featured = entries.filter((e) => e.rank <= 3);
  const rest = entries.filter((e) => e.rank >= 4);

  return (
    <>
      <div className="featured">
        {featured.map((row) => (
          <Row key={row.id} row={row} featured />
        ))}
      </div>
      {activitySlot}
      {rest.length > 0 ? (
        <div className="board-list">
          {rest.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </div>
      ) : null}
    </>
  );
}

/** Server-rendered variant for archive pages — no click counting on history. */
export function StaticListing({ rows }: { rows: PublicRow[] }) {
  return (
    <div className="board-list">
      {rows.map((row) => (
        <article className="list-row" key={row.id}>
          <div className="list-rank">#{row.rank}</div>
          <div className="list-body">
            <div className="list-top">
              <div className="list-name">
                <a
                  href={row.listingType === "handle"
                    ? `https://x.com/${row.listing.replace(/^@/, "")}`
                    : row.listing}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                >
                  {row.displayName}
                </a>
                <span className="tier-pill">{row.tierLabel}</span>
              </div>
            </div>
            <div className="list-desc">{row.description}</div>
            <div className="list-meta">
              <span className="clicks">{row.clicks.toLocaleString("en-US")} clicks</span>
            </div>
          </div>
          <div className="list-bid-col">
            <div className="list-bid">${row.price.toLocaleString("en-US")}</div>
          </div>
        </article>
      ))}
    </div>
  );
}

export const BoardCards = ListingCards;
