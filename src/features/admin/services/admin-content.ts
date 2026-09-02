import "server-only";
import { requireAdmin } from "@/lib/security/require-admin";
import type { EpisodeRow, SeriesRow } from "@/types/database.types";

export async function getAdminSeries(): Promise<SeriesRow[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("series").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAdminSeriesById(id: string): Promise<SeriesRow | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("series").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminEpisodes(): Promise<EpisodeRow[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("episodes").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAdminEpisodeById(id: string): Promise<EpisodeRow | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("episodes").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getNextEpisodeNumbers(seriesIds: string[]) {
  if (!seriesIds.length) return {} as Record<string, number>;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("episodes")
    .select("series_id,episode_number")
    .in("series_id", seriesIds);
  if (error) throw new Error(error.message);

  const highest = new Map<string, number>();
  for (const episode of data ?? []) {
    highest.set(episode.series_id, Math.max(highest.get(episode.series_id) ?? 0, episode.episode_number));
  }
  return Object.fromEntries(seriesIds.map((id) => [id, (highest.get(id) ?? 0) + 1]));
}
