import type { EpisodeRow } from "@/types/database.types";

export type PublicEpisode = Pick<
  EpisodeRow,
  | "id"
  | "series_id"
  | "episode_number"
  | "slug"
  | "title"
  | "short_synopsis"
  | "recap"
  | "highlights"
  | "video_provider"
  | "video_url"
  | "video_asset_id"
  | "thumbnail_url"
  | "duration_seconds"
  | "published_at"
  | "seo_title"
  | "seo_description"
>;

export interface EpisodeWithSeries extends PublicEpisode {
  seriesSlug: string;
  seriesTitle: string;
}

export type PublicEpisodeDetail = PublicEpisode & {
  videoAssetObjectKey: string | null;
};
