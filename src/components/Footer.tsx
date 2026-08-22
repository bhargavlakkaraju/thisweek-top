import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap row">
        <div>
          <strong>111111.live</strong> &mdash; paid placement, priced in ones.
          Not a quality score, not an endorsement.
        </div>
        <nav>
          <Link href="/rules">Rules</Link>
          <Link href="/stats">Stats</Link>
          <Link href="/weeks">Archive</Link>
          <Link href="/about">About</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
