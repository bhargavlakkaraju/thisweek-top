import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About - 111111.live",
  description:
    "Why 111111.live prices attention in ones, why seats expire instead of the board resetting, and why every number on the site is measured rather than estimated.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="wrap prose">
      <h1>About</h1>
      <p className="answer-first">
        111111.live is a paid placement board with six prices &mdash; $1, $11,
        $111, $1,111, $11,111 and $111,111 &mdash; and a fixed number of seats at
        each. The domain is the price list. That is the whole idea.
      </p>

      <h2>Why fixed prices</h2>
      <p>
        Auction boards have one failure mode in common: the top spot escalates
        until it is unreachable, the ladder stalls, and everyone who arrives late
        finds a board they cannot join. Fixed prices remove the arms race. You
        know what a rung costs before you click, and it costs the same tomorrow.
      </p>

      <h2>Why seats expire instead of the board resetting</h2>
      <p>
        A board that wipes itself every week destroys its own record, and a board
        that never clears sells out once and then has nothing left to sell. So
        seats carry their own terms. A $1 seat holds for a day, $11 for a week,
        $111 for a month, and up. Inventory frees up continuously, and the
        record survives.
      </p>
      <p>
        That record is the part most of these boards throw away. Every week here
        is frozen at a permanent URL in the <Link href="/weeks">archive</Link>,
        and every listing keeps a page showing each week it held a seat and what
        it drew in clicks. Rankings are temporary. The history is not.
      </p>

      <h2>Why the numbers are boring and true</h2>
      <p>
        Every click figure on this site is counted through our own redirect. We
        do not show a live visitor ticker, because we would have to invent it,
        and a site that sells attention cannot afford to make attention numbers
        up. What we can count, we publish at <Link href="/stats">/stats</Link>{" "}
        and in a public JSON feed. What we cannot count, we do not claim.
      </p>

      <h2>What this is not</h2>
      <p>
        It is not a directory, a review site, or a ranking of quality. Paying
        more moves you up and buys you nothing else. If a listing above yours
        looks better than yours, that is because it is above yours, not because
        anyone judged it.
      </p>

      <p className="muted">
        Read the <Link href="/rules">rules</Link> before you buy a seat.
      </p>
    </div>
  );
}
