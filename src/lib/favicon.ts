/** Resolve display favicon / logo for a listing. */
export function listingDomain(listing: string, listingType: "url" | "handle"): string | null {
  if (listingType === "handle") return "x.com";
  try {
    const withProto = /^https?:\/\//i.test(listing) ? listing : `https://${listing}`;
    const host = new URL(withProto).hostname.replace(/^www\./i, "");
    return host || null;
  } catch {
    return null;
  }
}

export function faviconFromDomain(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

export function resolveFaviconUrl(opts: {
  logoUrl?: string | null;
  listing: string;
  listingType: "url" | "handle";
}): string | null {
  if (opts.logoUrl && opts.logoUrl.trim()) return opts.logoUrl.trim();
  const domain = listingDomain(opts.listing, opts.listingType);
  if (!domain) return null;
  return faviconFromDomain(domain);
}
