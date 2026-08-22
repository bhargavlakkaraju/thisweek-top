import Link from "next/link";

export function Nav() {
  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="brand">
          ThisWeek<span>.</span>top
        </Link>
        <nav className="nav-links">
          <Link href="/rules">Rules</Link>
          <Link href="/about">About</Link>
          <Link href="/#claim" className="btn">
            Claim #1
          </Link>
        </nav>
      </div>
    </header>
  );
}
