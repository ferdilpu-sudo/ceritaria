import type { SeriesRow } from "@/types/database.types";

export type PublicSeries = Pick<
  SeriesRow,
  | "id"
  | "slug"
  | "title"
  | "short_synopsis"
  | "synopsis"
  | "genres"
  | "cover_url"
  | "hero_url"
  | "is_featured"
  | "published_at"
  | "seo_title"
  | "seo_description"
>;
