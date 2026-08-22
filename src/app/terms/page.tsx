import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms - 111111.live",
  description:
    "Terms for buying a placement seat on 111111.live: what a seat is, what it is not, refunds, removals, and liability.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="wrap prose">
      <h1>Terms</h1>
      <p className="answer-first">
        Buying a seat on 111111.live buys one thing: a listing at a stated rung
        for a stated term. It is advertising. It is not a review, a ranking, an
        endorsement, or a guarantee of traffic.
      </p>

      <h2>What you are buying</h2>
      <p>
        A seat in the price band you paid for, held for that band&apos;s term from
        the moment payment clears. Rank within the band is set by order of
        purchase. The <Link href="/rules">rules</Link> page describes the
        mechanics and forms part of these terms.
      </p>

      <h2>What we do not guarantee</h2>
      <p>
        Traffic, clicks, conversions, sales, or search ranking. We publish the
        click count we measure and nothing more. Outbound listing links carry{" "}
        <code>rel=&quot;sponsored&quot;</code> and are not intended to pass search
        ranking signal.
      </p>

      <h2>Refunds</h2>
      <p>
        Seats are non-refundable once live, because the placement begins
        immediately. Two exceptions: if we remove your listing for a reason that
        is not your breach of these terms, and if a technical fault on our side
        prevents your listing from appearing for a material part of its term, we
        refund pro rata.
      </p>

      <h2>Removals</h2>
      <p>
        We remove and refund listings that turn out to be adult content, malware,
        phishing, deceptive offers, or unlawful in the territories we operate in.
        We may remove a listing to comply with a legal request. We do not remove
        listings because a competitor asked.
      </p>

      <h2>The permanent seat</h2>
      <p>
        The $111,111 seat is sold once and does not expire. If this site ceases
        to operate, that seat ceases with it; it is not a perpetual obligation
        beyond the life of the site, and it carries no equity or ownership.
      </p>

      <h2>Liability</h2>
      <p>
        Our total liability for any claim relating to a seat is limited to what
        you paid for that seat. We are not liable for indirect or consequential
        loss.
      </p>

      <h2>Changes</h2>
      <p>
        We may change prices, seat counts, or terms for future purchases. Changes
        never alter a seat you have already bought &mdash; your term runs on the
        terms in force when you paid.
      </p>
    </div>
  );
}
