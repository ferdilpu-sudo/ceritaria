"use client";

import { useEffect } from "react";
import { rememberEpisode, updateWatchProgress } from "@/features/watch-history/services/watch-history";
import { subscribeWatchProgress } from "@/features/watch-history/services/watch-progress-events";

interface Props {
  episodeId: string;
  seriesSlug: string;
  seriesTitle: string;
  episodeSlug: string;
  episodeTitle: string;
  episodeNumber: number;
  thumbnailUrl: string | null;
}

export function ContinueWatchingTracker({ episodeId, seriesSlug, seriesTitle, episodeSlug, episodeTitle, episodeNumber, thumbnailUrl }: Props) {
  useEffect(() => {
    rememberEpisode({ seriesSlug, seriesTitle, episodeSlug, episodeTitle, episodeNumber, thumbnailUrl });
    return subscribeWatchProgress((detail) => {
      if (detail.episodeId !== episodeId) return;
      updateWatchProgress(seriesSlug, episodeSlug, detail.progressPercent);
    });
  }, [episodeId, seriesSlug, seriesTitle, episodeSlug, episodeTitle, episodeNumber, thumbnailUrl]);

  return null;
}
