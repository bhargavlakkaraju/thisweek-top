import { Webhooks } from "@polar-sh/nextjs";
import { applyPaidSeat } from "@/lib/board";
import { getTier } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function fulfillFromMetadata(
  metadata: Record<string, string> | undefined | null,
  orderId: string,
  checkoutId?: string,
) {
  if (!metadata) return;
  const { displayName, listing, listingKey } = metadata;
  const listingType = metadata.listingType as "url" | "handle" | undefined;
  const tier = getTier(metadata.tier);

  if (!displayName || !listing || !listingKey || !listingType || !tier) {
    console.warn("webhook missing or unknown tier metadata", metadata);
    return;
  }

  const description = (metadata.description || "").trim().slice(0, 140) || "Paid seat";

  await applyPaidSeat({
    displayName,
    listing,
    listingKey,
    listingType,
    logoUrl: metadata.logoUrl || undefined,
    description,
    tier: tier.id,
    orderId,
    checkoutId,
  });
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || "missing",
  onOrderPaid: async (payload) => {
    const order = payload.data;
    const meta = (order.metadata || {}) as Record<string, string>;
    const checkoutId =
      typeof order.checkoutId === "string"
        ? order.checkoutId
        : typeof (order as { checkout_id?: string }).checkout_id === "string"
          ? (order as { checkout_id?: string }).checkout_id
          : undefined;
    await fulfillFromMetadata(meta, order.id, checkoutId);
  },
  onCheckoutUpdated: async (payload) => {
    const checkout = payload.data;
    if (checkout.status !== "succeeded" && checkout.status !== "confirmed") return;
    const meta = (checkout.metadata || {}) as Record<string, string>;
    await fulfillFromMetadata(meta, `checkout:${checkout.id}`, checkout.id);
  },
});
