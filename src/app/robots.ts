import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/polar";

export default function robots(): MetadataRoute.Robots {
  const base = getAppUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/success"] },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
