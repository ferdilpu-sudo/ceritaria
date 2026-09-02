"use client";

import { useState } from "react";
import { MediaImage } from "@/components/ui/MediaImage";
import { buildFacebookEmbedUrl } from "@/features/episode/services/facebook-url";
import { trackEvent } from "@/lib/analytics/events";

interface FacebookVideoEmbedProps {
  permalink: string;
  thumbnailUrl: string | null;
  title: string;
  episodeId: string;
}

export function FacebookVideoEmbed({ permalink, thumbnailUrl, title, episodeId }: FacebookVideoEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const embedUrl = buildFacebookEmbedUrl(permalink);

  if (!loaded) {
    return (
      <div className="relative mx-auto aspect-[9/16] w-full max-w-none overflow-hidden rounded-none border-y border-white/10 bg-black sm:max-w-[480px] sm:rounded-2xl sm:border">
        <MediaImage src={thumbnailUrl} alt={`Thumbnail ${title}`} sizes="(max-width: 639px) 100vw, 480px" />
        <div className="absolute inset-0 bg-black/35" />
        <button
          type="button"
          className="absolute left-1/2 top-1/2 min-h-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)] px-7 font-black shadow-xl hover:bg-[var(--primary-hover)] active:scale-[0.98]"
          onClick={() => { trackEvent("play_intent", { episode_id: episodeId }); setLoaded(true); }}
          aria-label={`Putar ${title}`}
        >
          ▶ Putar episode
        </button>
        <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/80">Video diputar dari Facebook</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-none sm:max-w-[480px]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-none border-y border-white/10 bg-black sm:rounded-2xl sm:border">
        {!errored ? (
          <iframe
            title={`Facebook player ${title}`}
            src={embedUrl}
            className="h-full w-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            loading="eager"
            onError={() => setErrored(true)}
          />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center"><div><p className="font-bold">Video belum bisa dimuat.</p><button type="button" className="mt-4 min-h-11 rounded-xl border border-[var(--border)] px-4" onClick={() => { setErrored(false); setLoaded(false); }}>Coba lagi</button></div></div>
        )}
      </div>
      <div className="flex min-h-11 items-center justify-end px-1">
        <a href={permalink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-2 text-sm font-bold text-zinc-400 hover:text-white" onClick={() => trackEvent("facebook_fallback_click", { episode_id: episodeId })}>Buka di Facebook ↗</a>
      </div>
    </div>
  );
}
