import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "You're on the board - 111111.live",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_id?: string }>;
}) {
  const sp = await searchParams;
  const checkoutId = sp.checkout_id;

  return (
    <div className="wrap prose">
      <h1>You&apos;re on the board</h1>
      <p className="answer-first">
        Payment received. Your seat appears as soon as Polar confirms the order
        &mdash; usually a few seconds. The webhook is what actually places a
        listing, so if the board looks unchanged for a moment, give it one
        refresh.
      </p>
      <p>
        Your rung is yours for the full term. Nobody can outbid you off it, and
        the price you paid is the price you paid. We&apos;ll email you before it
        expires.
      </p>
      <p>
        Every click you receive is counted on your listing card, so you can work
        out what you actually paid per visit. We&apos;d rather you knew.
      </p>
      {checkoutId ? (
        <p className="muted" style={{ wordBreak: "break-all", fontSize: "0.78rem" }}>
          checkout: {checkoutId}
        </p>
      ) : null}
      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/">&larr; Back to the board</Link>
      </p>
    </div>
  );
}
