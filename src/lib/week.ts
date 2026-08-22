/** Monday 00:00 UTC week helpers for ThisWeek.top */

export function currentWeekId(now: Date = new Date()): string {
  const d = new Date(now);
  const day = d.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function weekStartUtc(weekId: string): Date {
  return new Date(`${weekId}T00:00:00.000Z`);
}

export function nextMondayUtc(now: Date = new Date()): Date {
  const thisMonday = weekStartUtc(currentWeekId(now));
  if (now.getTime() < thisMonday.getTime()) return thisMonday;
  const next = new Date(thisMonday);
  next.setUTCDate(next.getUTCDate() + 7);
  return next;
}

export function msUntilNextMonday(now: Date = new Date()): number {
  return Math.max(0, nextMondayUtc(now).getTime() - now.getTime());
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
  }
  return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MON = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatUtcShort(d: Date): string {
  return `${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
}

/** Human week range: "Week Mon 17 Aug → Mon 24 Aug UTC" */
export function formatWeekRange(
  weekId: string,
  resetsAt?: string | Date,
): string {
  const start = weekStartUtc(weekId);
  const end = resetsAt
    ? new Date(resetsAt)
    : (() => {
        const n = new Date(start);
        n.setUTCDate(n.getUTCDate() + 7);
        return n;
      })();
  return `Week ${formatUtcShort(start)} → ${formatUtcShort(end)} UTC`;
}
