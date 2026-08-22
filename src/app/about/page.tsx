import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - ThisWeek.top",
};

export default function AboutPage() {
  return (
    <div className="container prose">
      <h1>About</h1>
      <h2>What this is</h2>
      <p>
        ThisWeek.top is a public USD weekly pay-to-rank board. You bid. You
        rank for this week. Your listing is a product URL or an X @handle. The
        board resets every Monday 00:00 UTC.
      </p>
      <h2>What this is not</h2>
      <ul>
        <li>Not a forever leaderboard.</li>
        <li>Not a quality score or editorial ranking.</li>
        <li>Not a traffic or ROI promise.</li>
        <li>Not an AI ranking engine.</li>
        <li>Not a marketplace with categories.</li>
      </ul>
      <p>
        Domain: thisweek.top. Payments via Polar. Seats update when the webhook
        says the order is paid.
      </p>
    </div>
  );
}
