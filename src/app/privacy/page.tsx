import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy - 111111.live",
  description:
    "What 111111.live collects: listing details you submit, a click count per listing, and payment data handled by Polar. No advertising trackers.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="wrap prose">
      <h1>Privacy</h1>
      <p className="answer-first">
        We collect what a placement board needs and nothing else: the listing
        details you submit, a count of clicks each listing receives, and the
        payment record our processor gives us. There are no advertising trackers
        on this site.
      </p>

      <h2>What you give us</h2>
      <p>
        The URL or handle you list, plus the name, description and logo read from
        that page. All of it is public by design &mdash; it appears on the board.
      </p>

      <h2>What we measure</h2>
      <p>
        Outbound clicks per listing, counted through our own redirect. We store a
        number, not a profile: no cookie is set for it, and we do not build
        visitor profiles or sell data to anyone.
      </p>

      <h2>Payments</h2>
      <p>
        Payments are processed by Polar. Card details never touch our servers. We
        receive an order reference, the amount, and the metadata we sent with the
        checkout so we know which seat to place.
      </p>

      <h2>Email</h2>
      <p>
        If you buy a seat we email you about that seat &mdash; confirmation and an
        expiry reminder. We do not add you to a marketing list without you asking.
      </p>

      <h2>The archive</h2>
      <p>
        Past boards are kept permanently at their own URLs. A listing that
        appeared in a past week stays in that week&apos;s record. If you need a
        listing removed from the archive, ask and we will consider it against the
        integrity of the record.
      </p>

      <h2>Contact</h2>
      <p>Reach us through the account listed on the site for any privacy request.</p>
    </div>
  );
}
