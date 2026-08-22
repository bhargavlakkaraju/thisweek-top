export const APP_NAME = "111111";
export const APP_DOMAIN = "111111.live";
export const APP_TAGLINE = "Six prices. One ladder.";

/** The domain is the price list. Used in copy so the two can never drift. */
export const PRICE_LIST = "$1 - $11 - $111 - $1,111 - $11,111 - $111,111";

export type TierId = "t1" | "t11" | "t111" | "t1111" | "t11111" | "t111111";

export type Tier = {
  id: TierId;
  /** Flat price in whole USD. No auction, no outbidding. */
  price: number;
  /** null = unlimited seats. */
  seats: number | null;
  /** null = permanent, never expires. */
  durationDays: number | null;
  /** Short human duration, e.g. "1 week". */
  duration: string;
  /** Display label, e.g. "$1,111". */
  label: string;
};

/**
 * The ladder of ones. Ordered highest band first — index IS the rank band,
 * so a listing's position on the board is (band, then first-paid-first-placed).
 *
 * Each band grosses roughly the same per period ($12.2k-$12.3k), so annual
 * value is driven by how often the band recycles, not by its headline price.
 */
export const TIERS: Tier[] = [
  { id: "t111111", price: 111111, seats: 1, durationDays: null, duration: "permanent", label: "$111,111" },
  { id: "t11111", price: 11111, seats: 3, durationDays: 365, duration: "1 year", label: "$11,111" },
  { id: "t1111", price: 1111, seats: 11, durationDays: 91, duration: "1 quarter", label: "$1,111" },
  { id: "t111", price: 111, seats: 111, durationDays: 30, duration: "1 month", label: "$111" },
  { id: "t11", price: 11, seats: 1111, durationDays: 7, duration: "1 week", label: "$11" },
  { id: "t1", price: 1, seats: null, durationDays: 1, duration: "1 day", label: "$1" },
];

export const ENTRY_TIER: TierId = "t1";
export const TOP_TIER: TierId = "t111111";

const BY_ID = new Map<string, Tier>(TIERS.map((t) => [t.id, t]));

export function getTier(id: string | null | undefined): Tier | null {
  if (!id) return null;
  return BY_ID.get(id) ?? null;
}

/** Rank band index. Lower = higher on the board. */
export function tierRankIndex(id: TierId): number {
  const i = TIERS.findIndex((t) => t.id === id);
  return i < 0 ? TIERS.length : i;
}

/** Cheapest tier whose price is <= amount. Used to migrate legacy bid amounts. */
export function tierForLegacyAmount(amount: number): Tier {
  for (const t of TIERS) {
    if (amount >= t.price) return t;
  }
  return TIERS[TIERS.length - 1];
}

export function expiryFor(tier: Tier, from: Date = new Date()): string | null {
  if (tier.durationDays == null) return null;
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + tier.durationDays);
  return d.toISOString();
}

export function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

/** Descriptions used on /rules and the tier picker. */
export const TIER_BLURB: Record<TierId, string> = {
  t111111: "The One. A single seat, sold once, permanent. It never expires and never reopens.",
  t11111: "Three seats. Holds for a full year.",
  t1111: "Eleven seats. Holds for a quarter.",
  t111: "One hundred and eleven seats. Holds for a month.",
  t11: "1,111 seats. Holds for a week. The busiest band on the board.",
  t1: "Unlimited seats, one day each. The way in.",
};
