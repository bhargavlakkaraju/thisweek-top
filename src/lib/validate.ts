import { type Tier, type TierId, getTier } from "./constants";

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "gbraid",
  "wbraid",
  "mc_cid",
  "mc_eid",
  "ref",
  "ref_src",
  "ref_url",
  "si",
  "igshid",
  "mibextid",
]);

const SHORTENERS = new Set([
  "bit.ly",
  "bitly.com",
  "t.co",
  "tinyurl.com",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "rebrand.ly",
  "cutt.ly",
  "shorturl.at",
  "rb.gy",
  "t.ly",
  "tiny.cc",
  "lc.chat",
  "bl.ink",
]);

const CHAT_HOST_PATTERNS = [
  /(^|\.)t\.me$/i,
  /(^|\.)telegram\.me$/i,
  /(^|\.)telegram\.org$/i,
  /(^|\.)wa\.me$/i,
  /(^|\.)whatsapp\.com$/i,
  /(^|\.)chat\.whatsapp\.com$/i,
  /(^|\.)discord\.gg$/i,
  /(^|\.)discord\.com$/i,
  /(^|\.)discordapp\.com$/i,
  /(^|\.)signal\.me$/i,
  /(^|\.)line\.me$/i,
  /(^|\.)m\.me$/i,
];

const NSFW_HINTS = [
  /\bnsfw\b/i,
  /\bporn\b/i,
  /\bxxx\b/i,
  /\bonlyfans\b/i,
  /\bfansly\b/i,
  /\badult\b/i,
  /\bsex\b/i,
  /\berotic\b/i,
  /\bhentai\b/i,
  /\bxvideos\b/i,
  /\bpornhub\b/i,
  /\bxhamster\b/i,
  /\bredtube\b/i,
];

export type ValidatedListing =
  | { ok: true; listing: string; listingKey: string; listingType: "url" | "handle" }
  | { ok: false; error: string };

function stripTracking(url: URL): URL {
  const next = new URL(url.toString());
  for (const key of [...next.searchParams.keys()]) {
    if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith("utm_")) {
      next.searchParams.delete(key);
    }
  }
  next.hash = "";
  return next;
}

function hostOf(hostname: string): string {
  return hostname.replace(/^www\./i, "").toLowerCase();
}

export function validateListing(raw: string): ValidatedListing {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Listing is required." };

  if (trimmed.startsWith("@") || /^[A-Za-z0-9_]{1,15}$/.test(trimmed)) {
    const handle = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
    if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
      return { ok: false, error: "X handle must be 1-15 letters, numbers, or underscores." };
    }
    const listing = `@${handle}`;
    const blob = listing.toLowerCase();
    if (NSFW_HINTS.some((re) => re.test(blob))) {
      return { ok: false, error: "NSFW / adult listings are banned." };
    }
    return {
      ok: true,
      listing,
      listingKey: `handle:${handle.toLowerCase()}`,
      listingType: "handle",
    };
  }

  let parsed: URL;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsed = new URL(withProto);
  } catch {
    return { ok: false, error: "Enter a valid product URL or X @handle." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Only http(s) URLs are allowed." };
  }

  const host = hostOf(parsed.hostname);
  if (!host || !host.includes(".")) {
    return { ok: false, error: "Enter a valid product URL or X @handle." };
  }

  if (SHORTENERS.has(host)) {
    return { ok: false, error: "Link shorteners are not allowed. Use the real URL." };
  }

  if (CHAT_HOST_PATTERNS.some((re) => re.test(host))) {
    return { ok: false, error: "Chat invite links are banned." };
  }

  if (/discord\.com$/i.test(host) && /\/invite\//i.test(parsed.pathname)) {
    return { ok: false, error: "Chat invite links are banned." };
  }

  const cleaned = stripTracking(parsed);
  const listing = cleaned.toString().replace(/\/$/, "");
  const blob = `${listing} ${host}`.toLowerCase();
  if (NSFW_HINTS.some((re) => re.test(blob))) {
    return { ok: false, error: "NSFW / adult listings are banned." };
  }

  const listingKey = `url:${host}${cleaned.pathname.replace(/\/$/, "").toLowerCase()}`;
  return { ok: true, listing, listingKey, listingType: "url" };
}

export function validateDisplayName(name: string): string | null {
  const n = name.trim();
  if (n.length < 2) return "Display name must be at least 2 characters.";
  if (n.length > 40) return "Display name must be 40 characters or fewer.";
  if (NSFW_HINTS.some((re) => re.test(n))) return "NSFW / adult listings are banned.";
  return null;
}

export function validateLogoUrl(raw?: string): string | null {
  if (!raw || !raw.trim()) return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return "Logo URL must be http(s).";
    }
    return null;
  } catch {
    return "Logo URL is invalid.";
  }
}

export function validateTier(
  raw: unknown,
): { ok: true; tier: Tier } | { ok: false; error: string } {
  if (typeof raw !== "string" || !raw.trim()) {
    return { ok: false, error: "Pick a tier." };
  }
  const tier = getTier(raw.trim() as TierId);
  if (!tier) return { ok: false, error: "That tier does not exist." };
  return { ok: true, tier };
}

const MAX_DESCRIPTION = 140;

export function validateDescription(raw: string): { ok: true; description: string } | { ok: false; error: string } {
  const d = (raw || "").trim();
  if (!d) return { ok: false, error: "Description is required." };
  if (d.length > MAX_DESCRIPTION) {
    return { ok: false, error: `Description must be ${MAX_DESCRIPTION} characters or fewer.` };
  }
  if (NSFW_HINTS.some((re) => re.test(d))) {
    return { ok: false, error: "NSFW / adult listings are banned." };
  }
  return { ok: true, description: d };
}
