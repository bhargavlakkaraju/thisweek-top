import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  publicBoardView,
  readBoard,
  readWeekIndex,
  readWeekSnapshot,
} from "@/lib/board";
import { getAppUrl } from "@/lib/polar";
import type { PublicRow } from "@/lib/types";
import { formatWeekLabel } from "@/lib/week";

export const dynamic = "force-dynamic";

type Appearance = { weekId: string; row: PublicRow };

async function historyFor(listingKey: string): Promise<{
  current: PublicRow | null;
  appearances: Appearance[];
}> {
  const view = publicBoardView(await readBoard());
  const current = view.entries.find((e) => e.listingKey === listingKey) ?? null;

  const weeks = await readWeekIndex();
  const appearances: Appearance[] = [];
  for (const weekId of weeks.slice(0, 52)) {
    const snap = await readWeekSnapshot(weekId);
    const row = snap?.entries.find((e) => e.listingKey === listingKey);
    if (row) appearances.push({ weekId, row });
  }
  return { current, appearances };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const { key } = await params;
  const listingKey = decodeURIComponent(key);
  const { current, appearances } = await historyFor(listingKey);
  const name = current?.displayName ?? appearances[0]?.row.displayName ?? listingKey;
  return {
    title: `${name} on 111111.live`,
    description: `Every week ${name} has held a paid seat on 111111.live, with the price band and measured clicks for each.`,
    alternates: { canonical: `/listing/${encodeURIComponent(listingKey)}` },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const listingKey = decodeURIComponent(key);
  const { current, appearances } = await historyFor(listingKey);

  if (!current && appearances.length === 0) notFound();

  const row = current ?? appearances[0].row;
  const totalClicks =
    (current?.clicks ?? 0) + appearances.reduce((s, a) => s + a.row.clicks, 0);
  const base = getAppUrl();
  const href =
    row.listingType === "handle"
      ? `https://x.com/${row.listing.replace(/^@/, "")}`
      : row.listing;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: row.displayName,
    description: row.description,
    url: href,
    subjectOf: {
      "@type": "WebPage",
      url: `${base}/listing/${encodeURIComponent(listingKey)}`,
    },
  };

  return (
    <div className="wrap archive">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="archive-head">
        <p className="eyebrow">
          <Link href="/">Board</Link> / listing
        </p>
        <h1>{row.displayName}</h1>
        <p className="answer-first">
          {current
            ? `${row.displayName} currently holds a ${current.tierLabel} seat at #${current.rank} on 111111.live.`
            : `${row.displayName} does not hold a seat right now.`}{" "}
          {appearances.length > 0
            ? `It has appeared on ${appearances.length} archived ${appearances.length === 1 ? "week" : "weeks"}, drawing ${totalClicks.toLocaleString("en-US")} measured clicks in total.`
            : "This is its first appearance."}
        </p>
        <p className="muted">{row.description}</p>
        <p>
          <a href={href} target="_blank" rel="sponsored noopener noreferrer">
            {row.listing}
          </a>
        </p>
      </header>

      <h2 className="section-title">History</h2>
      {appearances.length === 0 ? (
        <p className="muted">No archived weeks yet.</p>
      ) : (
        <table className="history">
          <thead>
            <tr>
              <th>Week</th>
              <th>Rank</th>
              <th>Band</th>
              <th>Clicks</th>
            </tr>
          </thead>
          <tbody>
            {appearances.map((a) => (
              <tr key={a.weekId}>
                <td>
                  <Link href={`/week/${a.weekId}`}>{formatWeekLabel(a.weekId)}</Link>
                </td>
                <td>#{a.row.rank}</td>
                <td>{a.row.tierLabel}</td>
                <td>{a.row.clicks.toLocaleString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="honesty">
        Paid placement. Appearing here means a seat was bought, nothing more.
      </p>
    </div>
  );
}
