import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { PublicSeries } from "@/features/series/types/series";

const publicSeriesColumns = [
  "id", "slug", "title", "short_synopsis", "synopsis", "genres", "cover_url", "hero_url",
  "is_featured", "published_at", "seo_title", "seo_description",
].join(",");

export async function getPublishedSeries(limit = 24): Promise<PublicSeries[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("series")
    .select(publicSeriesColumns)
    .eq("is_published", true)
    .is("deleted_at", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Gagal memuat series: ${error.message}`);
  return (data ?? []) as unknown as PublicSeries[];
}

export async function getFeaturedSeries(): Promise<PublicSeries | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("series")
    .select(publicSeriesColumns)
    .eq("is_featured", true)
    .eq("is_published", true)
    .is("deleted_at", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat series unggulan: ${error.message}`);
  return data as unknown as PublicSeries | null;
}

export async function getPublishedSeriesBySlug(slug: string): Promise<PublicSeries | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("series")
    .select(publicSeriesColumns)
    .eq("slug", slug)
    .eq("is_published", true)
    .is("deleted_at", null)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat series: ${error.message}`);
  return data as unknown as PublicSeries | null;
}
