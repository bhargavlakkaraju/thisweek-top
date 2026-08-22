export type BoardEntry = {
  id: string;
  displayName: string;
  listing: string;
  listingKey: string;
  listingType: "url" | "handle";
  logoUrl?: string;
  /** Required on new claims; legacy seats may lack it until backfilled. */
  description: string;
  bid: number;
  paid: boolean;
  createdAt: string;
  updatedAt: string;
  orderId?: string;
  checkoutId?: string;
  clicks?: number;
};

export type ActivityEvent = {
  id: string;
  displayName: string;
  bid: number;
  rank?: number;
  kind: "bid" | "raise" | "took";
  at: string;
};

export type BoardState = {
  weekId: string;
  entries: BoardEntry[];
  activity?: ActivityEvent[];
  updatedAt: string;
};

export type CheckoutRequest = {
  displayName: string;
  listing: string;
  logoUrl?: string;
  description: string;
  bid: number;
};

export type PublicRow = {
  rank: number;
  id: string;
  displayName: string;
  listing: string;
  listingType: "url" | "handle";
  logoUrl: string | null;
  faviconUrl: string | null;
  description: string;
  bid: number;
  paid: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  claimThisRankPrice: number;
  clicks: number;
};
