"use client";

import { useEffect } from "react";
import { rememberEpisode } from "@/features/watch-history/services/watch-history";

interface Props {
  seriesSlug: string;
  seriesTitle: string;
  episodeSlug: string;
  episodeTitle: string;
  episodeNumber: number;
  thumbnailUrl: string | null;
}

export function ContinueWatchingTracker({ seriesSlug, seriesTitle, episodeSlug, episodeTitle, episodeNumber, thumbnailUrl }: Props) {
  useEffect(() => {
    rememberEpisode({ seriesSlug, seriesTitle, episodeSlug, episodeTitle, episodeNumber, thumbnailUrl });
  }, [seriesSlug, seriesTitle, episodeSlug, episodeTitle, episodeNumber, thumbnailUrl]);

  return null;
}
