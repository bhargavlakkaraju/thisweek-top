"use client";

import type { ActivityEvent } from "@/lib/types";
import { timeAgo } from "@/lib/timeAgo";

function activityWhat(a: ActivityEvent): string {
  if (a.kind === "raise") return `raised to $${a.bid}`;
  if (a.kind === "took" && a.rank) return `at #${a.rank} · $${a.bid}`;
  if (a.rank) return `at #${a.rank} · $${a.bid}`;
  return `bid $${a.bid}`;
}

function initial(name: string) {
  return (name.trim()[0] || "?").toUpperCase();
}

export function ActivityFeed({ activity }: { activity: ActivityEvent[] }) {
  if (activity.length === 0) {
    return (
      <div className="activity-block">
        <div className="activity-head">
          <span className="dot" /> Latest activity
        </div>
        <div className="activity-scroller">
          <div className="act-pill">
            <div className="av">·</div>
            <div>
              <div className="who">Quiet so far</div>
              <div className="detail">No bids yet this week</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-block">
      <div className="activity-head">
        <span className="dot" /> Latest activity
      </div>
      <div className="activity-scroller">
        {activity.map((a) => (
          <div className="act-pill" key={a.id}>
            <div className="av">{initial(a.displayName)}</div>
            <div>
              <div className="who">{a.displayName}</div>
              <div className="detail">{activityWhat(a)}</div>
              <div className="when">{timeAgo(a.at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
