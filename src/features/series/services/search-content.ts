import "server-only";
import { getPublishedSeries } from "@/features/series/services/public-series";
import { getLatestEpisodes } from "@/features/episode/services/public-episodes";

export async function searchPublishedContent(query: string) {
  const normalized = query.trim().toLocaleLowerCase("id-ID");
  if (normalized.length < 2) return { series: [], episodes: [] };

  const [series, episodes] = await Promise.all([getPublishedSeries(100), getLatestEpisodes(100)]);
  return {
    series: series.filter((item) => item.title.toLocaleLowerCase("id-ID").includes(normalized)),
    episodes: episodes.filter((item) =>
      `${item.title} ${item.seriesTitle}`.toLocaleLowerCase("id-ID").includes(normalized),
    ),
  };
}
