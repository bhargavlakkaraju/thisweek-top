import Link from "next/link";

export function Nav() {
  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          ThisWeek<span>.top</span>
        </Link>
        <nav className="nav-links">
          <Link href="/#board">Board</Link>
          <Link href="/#claim-top">Bump</Link>
          <Link href="/rules">Rules</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}
