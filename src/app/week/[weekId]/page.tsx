import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StaticListing } from "@/components/ListingCards";
import { publicBoardView, readBoard, readWeekSnapshot } from "@/lib/board";
import { getAppUrl } from "@/lib/polar";
import type { WeekSnapshot } from "@/lib/types";
import { currentWeekId, formatWeekLabel, isValidWeekId } from "@/lib/week";

export const dynamic = "force-dynamic";

async function loadWeek(weekId: string): Promise<WeekSnapshot | null> {
  const stored = await readWeekSnapshot(weekId);
  if (stored) return stored;
  // The live week has no frozen copy yet — render it from the board.
  if (weekId === currentWeekId()) {
    const view = publicBoardView(await readBoard());
    return {
      weekId,
      capturedAt: new Date().toISOString(),
      entries: view.entries,
      totals: view.totals,
    };
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ weekId: string }>;
}): Promise<Metadata> {
  const { weekId } = await params;
  const label = isValidWeekId(weekId) ? formatWeekLabel(weekId) : weekId;
  return {
    title: `The board, ${label} - 111111.live`,
    description: `Every paid listing on 111111.live for the week of ${label}, frozen as it stood. Rank, price band and measured clicks for each.`,
    alternates: { canonical: `/week/${weekId}` },
  };
}

export default async function WeekPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const { weekId } = await params;
  if (!isValidWeekId(weekId)) notFound();

  const snap = await loadWeek(weekId);
  if (!snap) notFound();

  const label = formatWeekLabel(weekId);
  const isLive = weekId === currentWeekId();
  const base = getAppUrl();

  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `111111.live board, ${label}`,
    description: `Paid placements on 111111.live for the week of ${label}: ${snap.totals.listings} listings, ${snap.totals.clicks} measured clicks, $${snap.totals.committed} committed.`,
    url: `${base}/week/${weekId}`,
    temporalCoverage: weekId,
    creator: { "@type": "Organization", name: "111111.live", url: base },
    isAccessibleForFree: true,
  };

  return (
    <div className="wrap archive">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dataset) }}
      />
      <header className="archive-head">
        <p className="eyebrow">
          <Link href="/weeks">Archive</Link> / {weekId}
        </p>
        <h1>The board, {label}</h1>
        <p className="answer-first">
          {snap.totals.listings === 0
            ? `No listings were on the board during ${label}.`
            : `${snap.totals.listings} listings held a paid seat during ${label}, together committing $${snap.totals.committed.toLocaleString("en-US")} and receiving ${snap.totals.clicks.toLocaleString("en-US")} measured clicks.`}{" "}
          {isLive
            ? "This week is still running, so the page updates until Monday."
            : "This page is frozen and will not change."}
        </p>
        <dl className="stat-strip">
          <div>
            <dt>Listings</dt>
            <dd>{snap.totals.listings.toLocaleString("en-US")}</dd>
          </div>
          <div>
            <dt>Committed</dt>
            <dd>${snap.totals.committed.toLocaleString("en-US")}</dd>
          </div>
          <div>
            <dt>Clicks</dt>
            <dd>{snap.totals.clicks.toLocaleString("en-US")}</dd>
          </div>
        </dl>
      </header>

      {snap.entries.length > 0 ? (
        <StaticListing rows={snap.entries} />
      ) : (
        <p className="muted">Nothing to show for this week.</p>
      )}

      <p className="honesty">
        Paid placement. Rank reflects which price band a listing bought, nothing
        else. Links are marked sponsored.
      </p>
    </div>
  );
}
