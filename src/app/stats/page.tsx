import type { Metadata } from "next";
import Link from "next/link";
import { publicBoardView, readBoard, readWeekIndex } from "@/lib/board";
import { getAppUrl } from "@/lib/polar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stats - what the board actually did - 111111.live",
  description:
    "Live, public numbers for 111111.live: seats taken per price band, total committed, measured clicks, and how many weeks are archived.",
  alternates: { canonical: "/stats" },
};

export default async function StatsPage() {
  const view = publicBoardView(await readBoard());
  const weeks = await readWeekIndex();
  const base = getAppUrl();

  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "111111.live open board data",
    description:
      "Seats taken per price band, dollars committed, and measured outbound clicks for the 111111.live paid placement board. Updated live.",
    url: `${base}/stats`,
    creator: { "@type": "Organization", name: "111111.live", url: base },
    isAccessibleForFree: true,
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${base}/api/board`,
      },
    ],
  };

  return (
    <div className="wrap archive">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dataset) }}
      />
      <header className="archive-head">
        <h1>Stats</h1>
        <p className="answer-first">
          111111.live currently carries {view.totals.listings.toLocaleString("en-US")}{" "}
          listings holding ${view.totals.committed.toLocaleString("en-US")} of paid
          seats, which have sent {view.totals.clicks.toLocaleString("en-US")} measured
          outbound clicks. {weeks.length} {weeks.length === 1 ? "week is" : "weeks are"}{" "}
          archived. Every number on this page is counted, not estimated, and the raw
          feed is public at <Link href="/api/board">/api/board</Link>.
        </p>
      </header>

      <h2 className="section-title">Seats by band</h2>
      <table className="history">
        <thead>
          <tr>
            <th>Band</th>
            <th>Term</th>
            <th>Taken</th>
            <th>Seats</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {view.tiers.map((t) => (
            <tr key={t.id}>
              <td>{t.label}</td>
              <td>{t.duration}</td>
              <td>{t.taken.toLocaleString("en-US")}</td>
              <td>{t.seats == null ? "unlimited" : t.seats.toLocaleString("en-US")}</td>
              <td>{t.soldOut ? "sold out" : "open"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="section-title">Archive</h2>
      <p className="muted">
        <Link href="/weeks">Every archived week</Link> keeps a permanent page.
      </p>
    </div>
  );
}
