"use client";

import { useState } from "react";

type Pending = {
  id: string;
  displayName: string;
  listing: string;
  bid: number;
  paid: boolean;
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [result, setResult] = useState("");
  const [pending, setPending] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(false);

  async function seed() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(
        `/api/admin/seed?key=${encodeURIComponent(secret)}`,
        {
          method: "POST",
          headers: { "x-admin-secret": secret },
        },
      );
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
      if (res.ok) await listPending();
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function listPending() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(
        `/api/admin/seed?key=${encodeURIComponent(secret)}`,
        { headers: { "x-admin-secret": secret } },
      );
      const data = await res.json();
      if (!res.ok) {
        setResult(JSON.stringify(data, null, 2));
        setPending([]);
      } else {
        setPending(data.pending || []);
        setResult(`Loaded ${data.entries?.length ?? 0} board rows.`);
      }
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container prose">
      <h1>Admin</h1>
      <p>
        Protect with ADMIN_SECRET via header x-admin-secret or ?key=. Seed demo
        rows and list pending (unpaid) listings.
      </p>
      <div className="admin-box">
        <label>
          ADMIN_SECRET
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.35rem",
              marginBottom: "0.75rem",
              background: "#0b0b12",
              border: "1px solid var(--line)",
              borderRadius: 10,
              color: "var(--text)",
              padding: "0.65rem 0.75rem",
            }}
          />
        </label>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="btn" type="button" onClick={seed} disabled={loading}>
            {loading ? "Working..." : "Reseed demos"}
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={listPending}
            disabled={loading}
          >
            List pending
          </button>
        </div>
        {result ? <pre>{result}</pre> : null}
        {pending.length > 0 ? (
          <>
            <h2>Pending / demo (unpaid)</h2>
            <ul>
              {pending.map((p) => (
                <li key={p.id}>
                  {p.displayName} · {p.listing} · ${p.bid}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
}
