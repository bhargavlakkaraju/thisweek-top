import type { TierId } from "./constants";

export type BoardEntry = {
  id: string;
  displayName: string;
  listing: string;
  listingKey: string;
  listingType: "url" | "handle";
  logoUrl?: string;
  description: string;
  /** Which band of the ladder this seat sits in. */
  tier: TierId;
  /** Price paid, in whole USD. Always equals the tier price. */
  price: number;
  paid: boolean;
  createdAt: string;
  updatedAt: string;
  /** ISO timestamp, or null for the permanent seat. */
  expiresAt: string | null;
  orderId?: string;
  checkoutId?: string;
  clicks?: number;
  /** Set on seeded placeholder rows so they can never be mistaken for real ones. */
  demo?: boolean;
};

export type ActivityEvent = {
  id: string;
  displayName: string;
  tier: TierId;
  price: number;
  rank?: number;
  kind: "claim" | "upgrade" | "expired";
  at: string;
};

export type BoardState = {
  /** Archive key for the current week. No longer a kill switch. */
  weekId: string;
  entries: BoardEntry[];
  activity?: ActivityEvent[];
  updatedAt: string;
};

export type PublicRow = {
  rank: number;
  id: string;
  displayName: string;
  listing: string;
  listingKey: string;
  listingType: "url" | "handle";
  logoUrl: string | null;
  faviconUrl: string | null;
  description: string;
  tier: TierId;
  tierLabel: string;
  price: number;
  paid: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  clicks: number;
};

export type TierAvailability = {
  id: TierId;
  label: string;
  price: number;
  duration: string;
  seats: number | null;
  taken: number;
  remaining: number | null;
  soldOut: boolean;
};

export type BoardView = {
  weekId: string;
  weekEndsAt: string;
  updatedAt: string;
  entries: PublicRow[];
  activity: ActivityEvent[];
  tiers: TierAvailability[];
  totals: {
    listings: number;
    paidListings: number;
    clicks: number;
    committed: number;
  };
};

export type WeekSnapshot = {
  weekId: string;
  capturedAt: string;
  entries: PublicRow[];
  totals: BoardView["totals"];
};
