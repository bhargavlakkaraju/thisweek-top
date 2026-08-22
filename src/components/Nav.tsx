import Link from "next/link";

export function Nav() {
  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            111111
          </span>
          <span className="brand-tld">.live</span>
        </Link>
        <nav className="nav-links">
          <Link href="/#board">Board</Link>
          <Link href="/#ladder">Ladder</Link>
          <Link href="/stats">Stats</Link>
          <Link href="/weeks">Archive</Link>
          <Link href="/rules">Rules</Link>
        </nav>
      </div>
    </header>
  );
}
