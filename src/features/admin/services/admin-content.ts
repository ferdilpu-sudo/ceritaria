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
