import Link from "next/link";

export function Nav() {
  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg
              className="brand-mark-svg"
              viewBox="0 0 20 20"
              width="18"
              height="18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1.25"
                y="1.25"
                width="17.5"
                height="17.5"
                rx="5"
                stroke="currentColor"
                strokeWidth="1.75"
              />
              <path
                d="M10 14.2V6.6"
                stroke="currentColor"
                strokeWidth="1.85"
                strokeLinecap="round"
              />
              <path
                d="M6.6 9.4 10 6.1 13.4 9.4"
                stroke="currentColor"
                strokeWidth="1.85"
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
