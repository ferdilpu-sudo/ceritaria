import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { PublicEpisode, EpisodeWithSeries } from "@/features/episode/types/episode";

const publicEpisodeColumns = [
  "id", "series_id", "episode_number", "slug", "title", "short_synopsis", "recap", "highlights",
  "video_provider", "video_url", "thumbnail_url", "duration_seconds", "published_at", "seo_title", "seo_description",
].join(",");

export async function getPublishedEpisodesForSeries(seriesId: string): Promise<PublicEpisode[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("episodes")
    .select(publicEpisodeColumns)
    .eq("series_id", seriesId)
    .eq("is_published", true)
    .is("deleted_at", null)
    .lte("published_at", new Date().toISOString())
    .order("episode_number", { ascending: true });

  if (error) throw new Error(`Gagal memuat episode: ${error.message}`);
  return (data ?? []) as unknown as PublicEpisode[];
}

export async function getPublishedEpisode(seriesId: string, slug: string): Promise<PublicEpisode | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("episodes")
    .select(publicEpisodeColumns)
    .eq("series_id", seriesId)
    .eq("slug", slug)
    .eq("is_published", true)
    .is("deleted_at", null)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat episode: ${error.message}`);
  return data as unknown as PublicEpisode | null;
}

export async function getLatestEpisodes(limit = 12): Promise<EpisodeWithSeries[]> {
  const supabase = createPublicClient();
  const { data: episodes, error } = await supabase
    .from("episodes")
    .select(publicEpisodeColumns)
    .eq("is_published", true)
    .is("deleted_at", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Gagal memuat episode terbaru: ${error.message}`);
  const rows = (episodes ?? []) as unknown as PublicEpisode[];
  const seriesIds = [...new Set(rows.map((episode) => episode.series_id))];
  if (!seriesIds.length) return [];

  const { data: seriesRows, error: seriesError } = await supabase
    .from("series")
    .select("id,slug,title")
    .in("id", seriesIds)
    .eq("is_published", true)
    .is("deleted_at", null);
  if (seriesError) throw new Error(`Gagal memuat konteks series: ${seriesError.message}`);

  const seriesMap = new Map((seriesRows ?? []).map((series) => [series.id, series]));
  return rows.flatMap((episode) => {
    const series = seriesMap.get(episode.series_id);
    return series ? [{ ...episode, seriesSlug: series.slug, seriesTitle: series.title }] : [];
  });
}
