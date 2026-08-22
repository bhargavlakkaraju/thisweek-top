"use client";

import type { ActivityEvent } from "@/lib/types";
import { timeAgo } from "@/lib/timeAgo";

function activityWhat(a: ActivityEvent): string {
  const price = `$${a.price.toLocaleString("en-US")}`;
  if (a.kind === "expired") return `seat expired · ${price}`;
  if (a.kind === "upgrade" && a.rank) return `moved up to #${a.rank} · ${price}`;
  if (a.rank) return `at #${a.rank} · ${price}`;
  return `took a ${price} seat`;
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
              <div className="detail">No seats taken yet</div>
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
