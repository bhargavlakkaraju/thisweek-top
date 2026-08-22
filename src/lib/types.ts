export type BoardEntry = {
  id: string;
  displayName: string;
  listing: string;
  listingKey: string;
  listingType: "url" | "handle";
  logoUrl?: string;
  bid: number;
  paid: boolean;
  createdAt: string;
  updatedAt: string;
  orderId?: string;
  checkoutId?: string;
};

export type BoardState = {
  weekId: string;
  entries: BoardEntry[];
  updatedAt: string;
};

export type CheckoutRequest = {
  displayName: string;
  listing: string;
  logoUrl?: string;
  bid: number;
};
