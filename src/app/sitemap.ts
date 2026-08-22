import type { MetadataRoute } from "next";
import { publicBoardView, readBoard, readWeekIndex } from "@/lib/board";
import { getAppUrl } from "@/lib/polar";
import { currentWeekId } from "@/lib/week";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppUrl();
  const now = new Date();

  const statics: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/rules`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/stats`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/weeks`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const weekIds = await readWeekIndex().catch(() => [] as string[]);
  const live = currentWeekId();
  const weeks = weekIds.includes(live) ? weekIds : [live, ...weekIds];
  const weekUrls: MetadataRoute.Sitemap = weeks.map((w) => ({
    url: `${base}/week/${w}`,
    lastModified: now,
    changeFrequency: w === live ? "hourly" : "yearly",
    priority: w === live ? 0.9 : 0.5,
  }));

  let listingUrls: MetadataRoute.Sitemap = [];
  try {
    const view = publicBoardView(await readBoard());
    listingUrls = view.entries.map((e) => ({
      url: `${base}/listing/${encodeURIComponent(e.listingKey)}`,
      lastModified: new Date(e.updatedAt || e.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    listingUrls = [];
  }

  return [...statics, ...weekUrls, ...listingUrls];
}
