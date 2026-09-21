"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { MediaImage } from "@/components/ui/MediaImage";
import { trackEvent } from "@/lib/analytics/events";
import type { FacebookEmbedStatus } from "@/features/episode/services/facebook-url";

interface FacebookVideoEmbedProps {
  permalink: string;
  thumbnailUrl: string | null;
  title: string;
  episodeId: string;
  embedStatus: FacebookEmbedStatus;
}

type FacebookSdkWindow = Window & {
  FB?: {
    XFBML?: {
      parse: (element?: HTMLElement) => void;
    };
  };
};

function parseFacebookEmbed(element: HTMLElement | null) {
  if (!element) return;
  (window as FacebookSdkWindow).FB?.XFBML?.parse(element);
}

export function FacebookVideoEmbed({
  permalink,
  thumbnailUrl,
  title,
  episodeId,
  embedStatus,
}: FacebookVideoEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const embedRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => parseFacebookEmbed(embedRootRef.current), 0);
    return () => window.clearTimeout(timer);
  }, [loaded, permalink]);

  if (embedStatus === "unavailable") {
    return (
      <div className="mx-auto w-full max-w-[480px]">
        <div className="relative aspect-[9/16] overflow-hidden rounded-2xl surface">
          <MediaImage src={thumbnailUrl} alt={`Thumbnail ${title}`} />
          <div className="absolute inset-0 grid place-items-center bg-black/65 p-6 text-center">
            <div>
              <p className="font-bold text-white">Video Facebook tidak tersedia untuk embed.</p>
              <p className="mt-2 text-sm text-zinc-300">Video mungkin dibatasi, dihapus, atau tidak lagi publik.</p>
            </div>
          </div>
        </div>
        <a
          href={permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-red-400 hover:text-red-300"
          onClick={() => trackEvent("facebook_fallback_click", { episode_id: episodeId })}
        >
          Tonton di Facebook ↗
        </a>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="relative mx-auto aspect-[9/16] w-full max-w-[480px] overflow-hidden rounded-2xl surface">
        <MediaImage src={thumbnailUrl} alt={`Thumbnail ${title}`} />
        <div className="absolute inset-0 bg-black/35" />
        <button
          type="button"
          className="absolute left-1/2 top-1/2 min-h-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)] px-7 font-black shadow-xl hover:bg-[var(--primary-hover)]"
          onClick={() => {
            trackEvent("play_intent", { episode_id: episodeId });
            setLoaded(true);
          }}
          aria-label={`Putar ${title}`}
        >
          ▶ Putar Episode
        </button>
        <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/80">
          Video diputar dari Facebook
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div
        ref={embedRootRef}
        className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black surface"
      >
        <div
          className="fb-video h-full w-full"
          data-href={permalink}
          data-width="480"
          data-show-text="false"
          data-allowfullscreen="true"
        />
      </div>

      <Script
        id="facebook-sdk"
        src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v25.0"
        strategy="afterInteractive"
        onReady={() => parseFacebookEmbed(embedRootRef.current)}
      />

      <a
        href={permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-red-400 hover:text-red-300"
        onClick={() => trackEvent("facebook_fallback_click", { episode_id: episodeId })}
      >
        Tonton di Facebook ↗
      </a>
    </div>
  );
}
