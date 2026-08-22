"use client";

import { useState } from "react";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function call(path: string, method: "GET" | "POST") {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${path}?key=${encodeURIComponent(secret)}`, {
        method,
        headers: { "x-admin-secret": secret },
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap prose">
      <h1>Admin</h1>
      <p>
        Board maintenance. The clear button is irreversible &mdash; it removes every
        row, paid seats included.
      </p>
      <p>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="ADMIN_SECRET"
          style={{
            width: "100%",
            maxWidth: "22rem",
            padding: "0.6rem 0.75rem",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            background: "var(--surface)",
          }}
        />
      </p>
      <p style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button className="btn-claim" disabled={!secret || loading} onClick={() => call("/api/admin/seed", "GET")}>
          View board
        </button>
        <button className="btn-claim" disabled={!secret || loading} onClick={() => call("/api/admin/seed", "POST")}>
          Seed demo rows
        </button>
        <button
          className="btn-claim"
          style={{ background: "var(--danger)" }}
          disabled={!secret || loading}
          onClick={() => {
            if (confirm("Remove every row from the board? This cannot be undone.")) {
              call("/api/admin/clear", "POST");
            }
          }}
        >
          Clear board
        </button>
      </p>
      {result ? (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            padding: "0.9rem",
            fontSize: "0.78rem",
            maxHeight: "26rem",
            overflow: "auto",
          }}
        >
          {result}
        </pre>
      ) : null}
    </div>
  );
}
