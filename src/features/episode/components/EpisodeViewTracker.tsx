"use client";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/events";

export function EpisodeViewTracker({ episodeId }: { episodeId: string }) {
  useEffect(() => { trackEvent("episode_view", { episode_id: episodeId }); }, [episodeId]);
  return null;
}
