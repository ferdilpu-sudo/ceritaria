"use client";

import { useState } from "react";
import { MediaImage } from "@/components/ui/MediaImage";
import { buildYouTubeEmbedUrl } from "@/features/episode/services/youtube-url";
import { trackEvent } from "@/lib/analytics/events";

interface YouTubeVideoEmbedProps {
  videoUrl: string;
  thumbnailUrl: string | null;
  title: string;
  episodeId: string;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <path d="M8 5.6v12.8a1 1 0 0 0 1.52.85l9.1-6.4a1 1 0 0 0 0-1.7l-9.1-6.4A1 1 0 0 0 8 5.6Z" />
    </svg>
  );
}

function EmptyThumbnail() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-950 to-black" aria-hidden="true">
      <div className="absolute -left-16 top-1/4 h-48 w-48 rounded-full bg-red-700/15 blur-3xl" />
      <div className="absolute -right-20 bottom-1/4 h-56 w-56 rounded-full bg-white/[0.035] blur-3xl" />
      <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export function YouTubeVideoEmbed({ videoUrl, thumbnailUrl, title, episodeId }: YouTubeVideoEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const [frameReady, setFrameReady] = useState(false);

  const startPlayback = () => {
    trackEvent("play_intent", { episode_id: episodeId });
    setLoaded(true);
  };

  return (
    <div className="mx-auto w-full max-w-none sm:max-w-[380px] lg:mx-0">
      <div className="relative aspect-[9/16] overflow-hidden rounded-none border-y border-white/10 bg-black shadow-none sm:rounded-[26px] sm:border sm:shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
        {!loaded ? (
          <>
            {thumbnailUrl ? (
              <MediaImage src={thumbnailUrl} alt={`Thumbnail ${title}`} sizes="(max-width: 639px) 100vw, 380px" className="scale-[1.01]" />
            ) : (
              <EmptyThumbnail />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/40" />
            <button
              type="button"
              onClick={startPlayback}
              aria-label={`Putar ${title}`}
              className="group absolute left-1/2 top-1/2 flex min-h-14 -translate-x-1/2 -translate-y-1/2 items-center gap-3 whitespace-nowrap rounded-full bg-white px-5 py-3 font-black text-black shadow-2xl transition hover:scale-[1.03] hover:bg-zinc-100 active:scale-[0.98]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--primary)] text-white transition group-hover:bg-[var(--primary-hover)]">
                <PlayIcon />
              </span>
              <span className="pr-1">Putar episode</span>
            </button>
          </>
        ) : (
          <>
            {!frameReady && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-zinc-950" role="status" aria-live="polite">
                <div className="text-center">
                  <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <p className="mt-4 text-sm font-semibold text-white/70">Menyiapkan video…</p>
                </div>
              </div>
            )}
            <iframe
              title={`YouTube player ${title}`}
              src={buildYouTubeEmbedUrl(videoUrl, true)}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setFrameReady(true)}
            />
          </>
        )}
      </div>

      <div className="flex min-h-11 items-center justify-end px-1 text-xs">
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-lg px-2 font-bold text-zinc-400 transition hover:text-white"
          onClick={() => trackEvent("youtube_fallback_click", { episode_id: episodeId })}
        >
          Buka di YouTube ↗
        </a>
      </div>
    </div>
  );
}
