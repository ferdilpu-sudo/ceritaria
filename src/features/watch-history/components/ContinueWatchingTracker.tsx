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

export function ContinueWatchingTracker(props: Props) {
  useEffect(() => {
    rememberEpisode(props);
  }, [props]);

  return null;
}
