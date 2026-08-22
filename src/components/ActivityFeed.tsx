"use client";

import type { ActivityEvent } from "@/lib/types";
import { timeAgo } from "@/lib/timeAgo";
import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/week";

function activityWhat(a: ActivityEvent): string {
  if (a.kind === "raise") return `raised to $${a.bid}`;
  if (a.kind === "took" && a.rank) return `bid $${a.bid} · took #${a.rank}`;
  if (a.rank) return `bid $${a.bid} · took #${a.rank}`;
  return `bid $${a.bid}`;
}

export function ActivityFeed({
  activity,
  resetsAt,
}: {
  activity: ActivityEvent[];
  resetsAt: string;
}) {
  const [timer, setTimer] = useState("");

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, new Date(resetsAt).getTime() - Date.now());
      setTimer(formatCountdown(ms));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resetsAt]);

  return (
    <aside className="rail">
      <div className="rail-card">
        <h3>Latest activity</h3>
        {activity.length === 0 ? (
          <p className="hint" style={{ margin: 0 }}>
            No bids yet this week.
          </p>
        ) : (
          <ul className="activity-list">
            {activity.map((a) => (
              <li key={a.id}>
                <span className="who">{a.displayName}</span>
                <span className="what">{activityWhat(a)}</span>
                <span className="when">{timeAgo(a.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="countdown-box">
        <div className="label">Board clears Monday 00:00 UTC</div>
        <div className="timer">{timer}</div>
      </div>
    </aside>
  );
}
