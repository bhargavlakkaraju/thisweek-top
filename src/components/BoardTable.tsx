"use client";

export type PublicRow = {
  rank: number;
  id: string;
  displayName: string;
  listing: string;
  listingType: "url" | "handle";
  logoUrl: string | null;
  bid: number;
  paid?: boolean;
  isDemo?: boolean;
};

function listingHref(listing: string, type: "url" | "handle") {
  if (type === "handle") {
    const handle = listing.replace(/^@/, "");
    return `https://x.com/${handle}`;
  }
  return listing;
}

export function BoardTable({
  entries,
  onRaise,
}: {
  entries: PublicRow[];
  onRaise?: (row: PublicRow) => void;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="board-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>URL/@</th>
            <th>Bid</th>
            <th>Claim/Raise</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty">
                This week is empty. Claim #1 for $5. Board resets Monday 00:00
                UTC.
              </td>
            </tr>
          ) : (
            entries.map((row) => {
              const demo = row.isDemo || row.paid === false;
              return (
                <tr key={row.id}>
                  <td className="rank">#{row.rank}</td>
                  <td>
                    <div className="name-cell">
                      {row.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className="logo"
                          src={row.logoUrl}
                          alt=""
                          width={28}
                          height={28}
                        />
                      ) : (
                        <div className="logo" aria-hidden />
                      )}
                      <strong>
                        {row.displayName}
                        {demo ? (
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: "0.65rem",
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              color: "var(--muted)",
                              border: "1px solid var(--line)",
                              borderRadius: 999,
                              padding: "0.1rem 0.4rem",
                              verticalAlign: "middle",
                              background: "var(--bg-elev-2)",
                            }}
                          >
                            Demo
                          </span>
                        ) : null}
                      </strong>
                    </div>
                  </td>
                  <td>
                    <a
                      className="listing"
                      href={listingHref(row.listing, row.listingType)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {row.listing}
                    </a>
                  </td>
                  <td className="bid">${row.bid}</td>
                  <td>
                    {!demo && onRaise ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => onRaise(row)}
                      >
                        Raise
                      </button>
                    ) : demo ? (
                      <span className="hint">Unpaid</span>
                    ) : null}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
