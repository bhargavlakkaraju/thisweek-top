import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy - ThisWeek.top",
};

export default function PrivacyPage() {
  return (
    <div className="container prose">
      <h1>Privacy</h1>
      <p>Last updated: 22 Aug 2026.</p>
      <p>
        We store board listings you submit (display name, URL or @handle,
        optional logo URL, bid amount) and payment metadata needed to confirm
        seats for the current week.
      </p>
      <h2>Payments</h2>
      <p>
        Card data is handled by Polar. We do not store full payment card
        numbers.
      </p>
      <h2>Logs</h2>
      <p>
        Server logs may include IP addresses and user agents for security and
        debugging.
      </p>
      <h2>Contact</h2>
      <p>Privacy questions: use the X link in the footer.</p>
    </div>
  );
}
