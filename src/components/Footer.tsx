import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container row">
        <div>ThisWeek.top. Weekly board. Paid status. Not a quality score.</div>
        <nav>
          <Link href="/rules">Rules</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <a
            href="https://x.com/thisweektop"
            target="_blank"
            rel="noreferrer"
          >
            @thisweektop
          </a>
        </nav>
      </div>
    </footer>
  );
}
