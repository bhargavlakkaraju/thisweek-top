import type { Metadata } from "next";
import Link from "next/link";
import { readWeekIndex } from "@/lib/board";
import { currentWeekId, formatWeekLabel } from "@/lib/week";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Archive - every week of the board - 111111.live",
  description:
    "Every week 111111.live has run, frozen at a permanent URL. Listings, price bands and measured clicks for each week.",
  alternates: { canonical: "/weeks" },
};

export default async function WeeksPage() {
  const stored = await readWeekIndex();
  const live = currentWeekId();
  const weeks = stored.includes(live) ? stored : [live, ...stored];

  return (
    <div className="wrap archive">
      <header className="archive-head">
        <h1>Archive</h1>
        <p className="answer-first">
          Every week the board has run keeps its own permanent page. Rankings
          expire; the record does not. {weeks.length}{" "}
          {weeks.length === 1 ? "week" : "weeks"} so far.
        </p>
      </header>
      <ul className="week-list">
        {weeks.map((w) => (
          <li key={w}>
            <Link href={`/week/${w}`}>
              <span className="week-label">{formatWeekLabel(w)}</span>
              <span className="week-id">{w}</span>
              {w === live ? <span className="tier-pill">live</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
