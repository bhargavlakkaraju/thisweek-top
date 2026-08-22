import { faviconFromDomain, listingDomain } from "./favicon";
import { validateListing } from "./validate";

export type ResolvedListing = {
  displayName: string;
  description: string;
  logoUrl: string | null;
  listing: string;
  listingKey: string;
  listingType: "url" | "handle";
};

function absUrl(base: string, maybe: string | null | undefined): string | null {
  if (!maybe) return null;
  const t = maybe.trim();
  if (!t) return null;
  try {
    return new URL(t, base).toString();
  } catch {
    return null;
  }
}

function metaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
      "i",
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function linkHref(html: string, relPart: string): string | null {
  const re = new RegExp(
    `<link[^>]+rel=["'][^"']*${relPart}[^"']*["'][^>]+href=["']([^"']+)["']`,
    "i",
  );
  const re2 = new RegExp(
    `<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*${relPart}[^"']*["']`,
    "i",
  );
  return html.match(re)?.[1]?.trim() || html.match(re2)?.[1]?.trim() || null;
}

function titleTag(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m?.[1]?.trim() || null;
}

function niceNameFromHost(host: string): string {
  const base = host.replace(/^www\./i, "").split(".")[0] || host;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

async function fetchHtml(url: string, ms = 2800): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; ThisWeekBot/1.0; +https://thisweek-ship.vercel.app)",
        accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!/text\/html|application\/xhtml/i.test(ct) && !ct.includes("text/")) {
      // still try for soft hosts
    }
    const text = await res.text();
    return text.slice(0, 400_000);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** Resolve display name, description, and best logo for a listing. */
export async function resolveListingIdentity(
  raw: string,
): Promise<{ ok: true; data: ResolvedListing } | { ok: false; error: string }> {
  const listing = validateListing(raw);
  if (!listing.ok) return { ok: false, error: listing.error };

  const domain = listingDomain(listing.listing, listing.listingType);
  const fallbackLogo = domain ? faviconFromDomain(domain) : null;

  if (listing.listingType === "handle") {
    const handle = listing.listing.replace(/^@/, "");
    const profileUrl = `https://x.com/${handle}`;
    const html = await fetchHtml(profileUrl);
    let logoUrl: string | null = null;
    let description = `X @${handle}`;
    let displayName = `@${handle}`;

    if (html) {
      logoUrl =
        absUrl(profileUrl, metaContent(html, "og:image")) ||
        absUrl(profileUrl, metaContent(html, "twitter:image")) ||
        null;
      const ogTitle = metaContent(html, "og:title");
      if (ogTitle) {
        displayName = ogTitle.replace(/\s*[|(·].*$/, "").trim().slice(0, 40) || displayName;
      }
      const ogDesc = metaContent(html, "og:description") || metaContent(html, "description");
      if (ogDesc) description = ogDesc.slice(0, 140);
    }

    if (!logoUrl) {
      logoUrl = `https://unavatar.io/x/${encodeURIComponent(handle)}`;
    }
    if (!logoUrl) logoUrl = fallbackLogo;

    return {
      ok: true,
      data: {
        displayName: displayName.slice(0, 40),
        description: description.slice(0, 140) || "Paid seat",
        logoUrl,
        listing: listing.listing,
        listingKey: listing.listingKey,
        listingType: listing.listingType,
      },
    };
  }

  const pageUrl = listing.listing;
  const html = await fetchHtml(pageUrl);
  let displayName = domain ? niceNameFromHost(domain) : "Listing";
  let description = "Paid seat";
  let logoUrl: string | null = null;

  if (html) {
    const ogTitle = metaContent(html, "og:title") || titleTag(html);
    if (ogTitle) {
      displayName = ogTitle.replace(/\s*[|(·].*$/, "").trim().slice(0, 40) || displayName;
    }
    const ogDesc = metaContent(html, "og:description") || metaContent(html, "description");
    if (ogDesc) description = ogDesc.slice(0, 140);

    logoUrl =
      absUrl(pageUrl, metaContent(html, "og:image")) ||
      absUrl(pageUrl, metaContent(html, "twitter:image")) ||
      absUrl(pageUrl, linkHref(html, "apple-touch-icon")) ||
      absUrl(pageUrl, linkHref(html, "icon")) ||
      null;
  }

  if (!logoUrl) logoUrl = fallbackLogo;

  // Ensure display name length for validateDisplayName (>=2)
  if (displayName.trim().length < 2) {
    displayName = domain ? niceNameFromHost(domain) : "Product";
  }

  return {
    ok: true,
    data: {
      displayName: displayName.slice(0, 40),
      description: (description.trim() || "Paid seat").slice(0, 140),
      logoUrl,
      listing: listing.listing,
      listingKey: listing.listingKey,
      listingType: listing.listingType,
    },
  };
}


/** Alias used by checkout / resolve-listing routes. */
export const resolveListingMeta = resolveListingIdentity;
