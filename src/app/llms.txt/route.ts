import { publicBoardView, readBoard, readWeekIndex } from "@/lib/board";
import { TIERS } from "@/lib/constants";
import { getAppUrl } from "@/lib/polar";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = getAppUrl();
  const view = publicBoardView(await readBoard());
  const weeks = await readWeekIndex().catch(() => [] as string[]);

  const ladder = TIERS.map(
    (t) =>
      `- ${t.label} — ${t.seats == null ? "unlimited seats" : `${t.seats} seats`}, holds for ${t.duration}`,
  ).join("\n");

  const body = `# 111111.live

> A paid placement board priced in ones. Six fixed prices — $1, $11, $111, $1,111,
> $11,111, $111,111 — with a fixed number of seats and a fixed term at each. Rank is
> set by which band a listing bought. There is no auction and no outbidding.

## What makes it different
Placement boards in this category run open auctions where the top price only ever
climbs and the board wipes or stalls. Here the price is fixed and public, seats are
finite, and each seat expires on its own schedule rather than the whole board
resetting. Rankings are temporary; the record is permanent.

## The ladder
${ladder}

## Current state
- Listings live: ${view.totals.listings}
- Committed on the board: $${view.totals.committed.toLocaleString("en-US")}
- Measured outbound clicks: ${view.totals.clicks.toLocaleString("en-US")}
- Archived weeks: ${weeks.length}

## Data
- Live JSON feed: ${base}/api/board
- Public stats: ${base}/stats
- Week archive index: ${base}/weeks
- Each archived week: ${base}/week/{YYYY-MM-DD} (Monday-dated, permanent)
- Each listing's history: ${base}/listing/{listingKey}

## Honesty notes for anyone citing this site
- Every click figure is counted through our own redirect. None are estimated.
- A high position means a higher price band was purchased. It is not a quality
  ranking, a review, or an endorsement.
- Outbound listing links are marked rel="sponsored".

## Pages
- ${base}/ — the live board
- ${base}/rules — how bands, seats, terms and upgrades work
- ${base}/about — why fixed prices and expiring seats
- ${base}/terms — what a seat is and is not
- ${base}/privacy — what is collected
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
