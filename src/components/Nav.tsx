import Link from "next/link";

export function Nav() {
  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg
              className="brand-mark-svg"
              viewBox="0 0 22 14"
              width="18"
              height="12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.5 7.2 4.8 10.4 11.2 2.2"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.2 7.2 12.5 10.4 19.2 2"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
