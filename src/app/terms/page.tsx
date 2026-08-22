import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms - ThisWeek.top",
};

export default function TermsPage() {
  return (
    <div className="container prose">
      <h1>Terms</h1>
      <p>Last updated: 22 Aug 2026.</p>
      <p>
        ThisWeek.top sells paid placement on a public weekly leaderboard. A bid
        is a purchase of status for the current week only (Monday 00:00 UTC to
        next Monday 00:00 UTC), not an investment product and not a guarantee of
        traffic, sales, or reputation. The board resets every Monday.
      </p>
      <h2>Payments</h2>
      <p>
        Payments are processed by Polar in USD. A seat is confirmed only after
        Polar notifies us that the order is paid. Chargebacks or refunds may
        remove a seat. Seats do not carry over after the weekly reset.
      </p>
      <h2>Acceptable use</h2>
      <p>
        No NSFW / adult listings, chat invite links, or link shorteners. We may
        remove listings that break these rules without refund when abuse is
        clear.
      </p>
      <h2>Contact</h2>
      <p>Disputes: reach out via the X link in the footer.</p>
    </div>
  );
}
