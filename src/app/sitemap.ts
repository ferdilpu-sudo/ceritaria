import type { MetadataRoute } from "next";
import { getPublishedSeries } from "@/features/series/services/public-series";
import { getLatestEpisodes } from "@/features/episode/services/public-episodes";
import { getPublicEnv } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  const [series, episodes] = await Promise.all([getPublishedSeries(1000), getLatestEpisodes(1000)]);
  const staticPages: MetadataRoute.Sitemap = ["", "/about", "/contact", "/privacy", "/terms"].map((path) => ({
    url: `${NEXT_PUBLIC_SITE_URL}${path}`,
    changeFrequency: path === "" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.4,
  }));
  const seriesPages: MetadataRoute.Sitemap = series.map((item) => ({
    url: `${NEXT_PUBLIC_SITE_URL}/series/${item.slug}`,
    lastModified: item.published_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  const episodePages: MetadataRoute.Sitemap = episodes.map((episode) => ({
    url: `${NEXT_PUBLIC_SITE_URL}/series/${episode.seriesSlug}/${episode.slug}`,
    lastModified: episode.published_at ?? undefined,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...staticPages, ...seriesPages, ...episodePages];
}
