import type { Metadata } from "next";
import Link from "next/link";
import { TIERS, TIER_BLURB } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Rules - 111111.live",
  description:
    "How 111111.live works: six fixed prices, finite seats per band, a fixed term per band, and no bidding. Rank is set by which band you bought.",
  alternates: { canonical: "/rules" },
};

export default function RulesPage() {
  return (
    <div className="wrap prose">
      <h1>Rules</h1>
      <p className="answer-first">
        111111.live sells placement at six fixed prices. Your price decides your
        band, your band decides your rank, and your seat is yours for that
        band&apos;s full term. There is no auction. Nobody can outbid you, and no
        price climbs while you hold a seat.
      </p>

      <h2>The ladder</h2>
      <table className="history">
        <thead>
          <tr>
            <th>Price</th>
            <th>Seats</th>
            <th>Term</th>
            <th>What it is</th>
          </tr>
        </thead>
        <tbody>
          {TIERS.map((t) => (
            <tr key={t.id}>
              <td>
                <strong>{t.label}</strong>
              </td>
              <td>{t.seats == null ? "unlimited" : t.seats.toLocaleString("en-US")}</td>
              <td>{t.duration}</td>
              <td>{TIER_BLURB[t.id]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>How rank works</h2>
      <ol>
        <li>
          Higher band always sits above lower band. Every $1,111 seat outranks
          every $111 seat, no matter when either was bought.
        </li>
        <li>
          Inside a band, the earlier seat sits higher. First paid, first placed.
          Buy early in a band and you stay ahead of everyone who joins it later.
        </li>
        <li>
          Nothing displaces a paid seat before its term ends. Not a bigger
          cheque, not us.
        </li>
      </ol>

      <h2>When a term ends</h2>
      <p>
        Your listing simply leaves the board. We email you before it does. The
        seat reopens for whoever wants it next, which is the only way a full band
        ever frees up.
      </p>
      <p>
        The one exception is <strong>$111,111</strong>. It is a single seat, sold
        once, and it never expires and never returns. When it goes, it is gone
        for the life of this site.
      </p>

      <h2>Moving up</h2>
      <p>
        Enter the same URL or handle and buy a higher band. You pay that
        band&apos;s full price and start a fresh term at the higher rung. There is
        no pro-rata credit for the seat you are leaving &mdash; the prices are low
        enough that the accounting would cost more than it saves.
      </p>

      <h2>What we do not promise</h2>
      <ul>
        <li>
          <strong>Traffic.</strong> We publish the click count for every listing,
          measured on our side. Divide by what you paid and you have your real
          cost per click. We will never estimate it for you.
        </li>
        <li>
          <strong>Quality.</strong> A high rung means somebody paid for it. It is
          not a review, a ranking, or an endorsement.
        </li>
        <li>
          <strong>SEO.</strong> Every outbound listing link is marked{" "}
          <code>rel=&quot;sponsored&quot;</code>, because that is what it is.
          Anyone selling you paid links that pass ranking signal is selling you a
          penalty.
        </li>
      </ul>

      <h2>What gets refused</h2>
      <p>
        Adult content, link shorteners, and chat-invite links are rejected at
        submission. If something slips through we remove it and refund the seat.
      </p>

      <h2>The record</h2>
      <p>
        Seats expire; the record does not. Every week is frozen at its own
        permanent page in the <Link href="/weeks">archive</Link>, and every
        listing keeps a page showing each week it appeared and what it earned in
        clicks. The live numbers are public at <Link href="/stats">/stats</Link>{" "}
        and in the open feed at <Link href="/api/board">/api/board</Link>.
      </p>
    </div>
  );
}
