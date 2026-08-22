import { APP_DOMAIN } from "./constants";

const CANONICAL = `https://${APP_DOMAIN}`;

/**
 * Absolute base URL for canonicals, sitemap, robots, llms.txt, JSON-LD and the
 * payment success URL.
 *
 * Order matters. NEXT_PUBLIC_APP_URL wins so the domain can be changed without a
 * code edit. Otherwise production is always the canonical domain — never
 * VERCEL_URL, which is a per-deployment hostname and would put a throwaway URL
 * in every canonical tag. Preview builds do use VERCEL_URL so links resolve to
 * the deployment being previewed.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  if (process.env.VERCEL_ENV === "production") return CANONICAL;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;

  if (process.env.NODE_ENV === "production") return CANONICAL;

  return "http://127.0.0.1:3000";
}
