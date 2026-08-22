"use client";

import { track as vercelTrack } from "@vercel/analytics";

type Props = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    datafast?: (goal: string, props?: Record<string, unknown>) => void;
  }
}

/**
 * One call, three destinations: Vercel Web Analytics (always on), GA4 and
 * DataFast (each active only when its env var is set). Every destination is
 * wrapped so a blocked script can never break the page it is measuring.
 */
export function track(event: string, props: Props = {}): void {
  if (typeof window === "undefined") return;

  try {
    vercelTrack(event, props);
  } catch {
    /* analytics must never throw into the UI */
  }

  try {
    window.gtag?.("event", event, props);
  } catch {
    /* ignore */
  }

  try {
    // DataFast goal names allow letters, numbers, spaces, underscores, hyphens.
    window.datafast?.(event, props);
  } catch {
    /* ignore */
  }
}

/** Revenue-shaped event. GA4 wants `value` + `currency` for reporting. */
export function trackPurchaseIntent(opts: {
  tier: string;
  price: number;
  mode: string;
}): void {
  track("begin_checkout", {
    tier: opts.tier,
    value: opts.price,
    currency: "USD",
    mode: opts.mode,
  });
}
