"use client";

import { useEffect, useState } from "react";
import { formatCountdown, msUntilNextMonday } from "@/lib/week";

export function WeekCountdown({ resetsAt }: { resetsAt: string }) {
  const [label, setLabel] = useState(() => {
    const target = new Date(resetsAt).getTime();
    return formatCountdown(Math.max(0, target - Date.now()));
  });

  useEffect(() => {
    const tick = () => {
      const target = new Date(resetsAt).getTime();
      const ms = Math.max(0, target - Date.now());
      setLabel(formatCountdown(ms || msUntilNextMonday()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resetsAt]);

  return (
    <div className="countdown" role="timer" aria-live="polite">
      <span className="countdown-label">Resets Monday 00:00 UTC in</span>
      <strong className="countdown-value">{label}</strong>
    </div>
  );
}
