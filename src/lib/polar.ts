import { Polar } from "@polar-sh/sdk";

export function getPolarServer(): "sandbox" | "production" {
  const v = (process.env.POLAR_SERVER || "sandbox").toLowerCase();
  return v === "production" ? "production" : "sandbox";
}

export function polarConfigured(): boolean {
  return Boolean(
    process.env.POLAR_ACCESS_TOKEN &&
      process.env.POLAR_PRODUCT_ID &&
      process.env.POLAR_WEBHOOK_SECRET,
  );
}

export function getPolarClient(): Polar {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not set");
  }
  return new Polar({
    accessToken,
    server: getPolarServer(),
  });
}

export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000").replace(
    /\/$/,
    "",
  );
}

export function getProductId(): string {
  const id = process.env.POLAR_PRODUCT_ID;
  if (!id) throw new Error("POLAR_PRODUCT_ID is not set");
  return id;
}

export type CheckoutMeta = {
  displayName: string;
  listing: string;
  listingKey: string;
  listingType: "url" | "handle";
  logoUrl: string;
  bid: string;
  chargeAmount: string;
  mode: "claim" | "raise";
};

export async function createCheckoutSession(opts: {
  chargeCents: number;
  metadata: CheckoutMeta;
  customerIp?: string;
}) {
  const polar = getPolarClient();
  const productId = getProductId();
  const appUrl = getAppUrl();

  // Product should allow custom / pay-what-you-want amounts. amount is cents.
  const metadata: Record<string, string> = {};
  for (const [k, v] of Object.entries(opts.metadata)) {
    if (v != null && String(v).length > 0) metadata[k] = String(v);
  }

  const checkout = await polar.checkouts.create({
    products: [productId],
    amount: opts.chargeCents,
    successUrl: `${appUrl}/success?checkout_id={CHECKOUT_ID}`,
    metadata,
    customerIpAddress: opts.customerIp,
  });

  return checkout;
}
