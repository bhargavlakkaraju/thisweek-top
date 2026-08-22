import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rules - ThisWeek.top",
};

export default function RulesPage() {
  return (
    <div className="container prose">
      <h1>Rules</h1>
      <p>
        ThisWeek.top is a public leaderboard for one week at a time. There are
        no ads, no API keys, and no revenue share. You pay to stand above
        everyone else for this week. Rank is the bid - nothing else.
      </p>

      <h2>The week</h2>
      <ul>
        <li>
          The board resets every <strong>Monday 00:00 UTC</strong>. Everyone
          starts over.
        </li>
        <li>Bids from last week do not carry. The crown is weekly.</li>
      </ul>

      <h2>Bidding</h2>
      <ul>
        <li>
          New listings: whole US dollars. Minimum <strong>$5</strong>.
        </li>
        <li>
          Taking #1 costs at least <strong>$5 more</strong> than the current
          week top bid. Paying less still puts you on the board at whatever
          place that bid can take.
        </li>
        <li>
          Equal bids stay in the order placed. The older bid keeps the higher
          rank.
        </li>
        <li>
          To raise: enter the same website or X @handle again. Your new bid must
          be above your current bid. You only pay the difference.
        </li>
        <li>
          A completed payment (Polar webhook) is what claims the rank.
        </li>
      </ul>

      <h2>What you can list</h2>
      <ul>
        <li>A product website, or an X @handle.</li>
      </ul>

      <h2>What you cannot list</h2>
      <ul>
        <li>
          Chat or invite links (Telegram, WhatsApp, Discord, Messenger, Signal,
          and similar).
        </li>
        <li>Sexual content, porn, NSFW, or adult platforms.</li>
        <li>Link shortener URLs as the listed address.</li>
        <li>Tracking junk. Query parameters are stripped.</li>
      </ul>

      <h2>What you are not buying</h2>
      <ul>
        <li>Not a quality score.</li>
        <li>Not an algorithm rank.</li>
        <li>Not a promise of traffic, leads, or revenue.</li>
        <li>You are buying the seat for this week. That is the product.</li>
      </ul>
    </div>
  );
}
