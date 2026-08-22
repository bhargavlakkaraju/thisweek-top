import { HomeBoard } from "@/components/ClaimForm";
import { WeekCountdown } from "@/components/WeekCountdown";
import { publicBoardView, readBoard } from "@/lib/board";
import { formatWeekRange } from "@/lib/week";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const state = await readBoard();
  const view = publicBoardView(state);
  const top = view.entries[0];
  const weekLabel = formatWeekRange(view.weekId, view.resetsAt);

  return (
    <div className="container">
      <section className="hero hero-quiet">
        <h1>
          Claim #1 for <em>${view.claimOnePrice}</em>
        </h1>
        <p className="lead">
          Pay to stand above everyone else this week. Rank is the bid. Board
          resets Monday 00:00 UTC.
        </p>
        <p className="quiet-top">
          {top
            ? `Current #1: ${top.displayName} · $${top.bid}`
            : "No #1 yet · open seat"}
          {" · "}
          {weekLabel}
        </p>
        <a className="btn" href="#claim">
          Claim #1 for ${view.claimOnePrice}
        </a>
        <WeekCountdown resetsAt={view.resetsAt} />
      </section>

      <HomeBoard
        initialEntries={view.entries}
        claimOnePrice={view.claimOnePrice}
      />

      <section className="steps">
        <div className="step">
          <strong>1. Drop your URL or @</strong>
          Product site or X handle. No chat invites, no shorteners.
        </div>
        <div className="step">
          <strong>2. Outbid</strong>
          Min $5. Take this week&apos;s #1 with week top + $5. Raise pays only
          the difference.
        </div>
        <div className="step">
          <strong>3. Own the week</strong>
          Polar checkout. Webhook confirms. Screenshot before Monday reset.
        </div>
      </section>

      <div className="honesty">
        Paid status. Not a quality score. No traffic promises. No forever rank.
        Board clears Monday 00:00 UTC.
      </div>
    </div>
  );
}
