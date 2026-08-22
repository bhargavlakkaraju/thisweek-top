import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Success - ThisWeek.top",
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_id?: string }>;
}) {
  const sp = await searchParams;
  const checkoutId = sp.checkout_id;

  return (
    <div className="container">
      <div className="success-card">
        <h1>Payment received</h1>
        <p>
          If Polar confirms the order, your seat updates on this week&apos;s
          board. Webhook is the source of truth. Hold it until Monday reset.
        </p>
        <div className="big">ThisWeek</div>
        <p style={{ color: "var(--muted)" }}>
          Screenshot this. Share the board. Flex the week.
        </p>
        {checkoutId ? (
          <p className="hint" style={{ wordBreak: "break-all" }}>
            checkout: {checkoutId}
          </p>
        ) : null}
        <p style={{ marginTop: "1.25rem" }}>
          <Link className="btn" href="/">
            Back to board
          </Link>
        </p>
      </div>
    </div>
  );
}
