"use client";

import Link from "next/link";
import type { PublicEpisode } from "@/features/episode/types/episode";
import { trackEvent } from "@/lib/analytics/events";

interface Props {
  seriesSlug: string;
  previous?: PublicEpisode;
  next?: PublicEpisode;
}

export function EpisodeNavigation({ seriesSlug, previous, next }: Props) {
  return (
    <nav aria-label="Navigasi episode" className="grid grid-cols-2 gap-2.5 sm:gap-3">
      {previous ? (
        <Link href={`/series/${seriesSlug}/${previous.slug}`} onClick={() => trackEvent("previous_episode_click", { episode_id: previous.id })} className="surface flex min-h-13 items-center rounded-2xl px-4 py-3 text-sm font-bold transition active:scale-[0.98] sm:min-h-12 sm:rounded-xl sm:hover:border-zinc-500 sm:hover:bg-[var(--surface-2)]">← Episode {previous.episode_number}</Link>
      ) : <div aria-hidden="true" />}
      {next ? (
        <Link href={`/series/${seriesSlug}/${next.slug}`} onClick={() => trackEvent("next_episode_click", { episode_id: next.id })} className="flex min-h-13 items-center justify-end rounded-2xl bg-[var(--primary)] px-4 py-3 text-right text-sm font-bold transition active:scale-[0.98] sm:min-h-12 sm:rounded-xl sm:hover:bg-[var(--primary-hover)]">Episode {next.episode_number} →</Link>
      ) : <div aria-hidden="true" />}
    </nav>
  );
}
