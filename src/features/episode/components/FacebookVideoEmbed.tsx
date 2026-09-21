"use client";

import { MediaImage } from "@/components/ui/MediaImage";
import { trackEvent } from "@/lib/analytics/events";

interface FacebookVideoEmbedProps {
  permalink: string;
  thumbnailUrl: string | null;
  title: string;
  episodeId: string;
}

export function FacebookVideoEmbed({
  permalink,
  thumbnailUrl,
  title,
  episodeId,
}: FacebookVideoEmbedProps) {
  return (
    <div className="mx-auto w-full max-w-none sm:max-w-[480px]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-none border-y border-white/10 bg-black sm:rounded-2xl sm:border">
        <MediaImage
          src={thumbnailUrl}
          alt={`Thumbnail ${title}`}
          sizes="(max-width: 639px) 100vw, 480px"
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div className="max-w-sm">
            <p className="text-lg font-black text-white">Tonton video di Facebook</p>
            <p className="mt-2 text-sm leading-6 text-zinc-200">
              Facebook tidak selalu mengizinkan Reel diputar di situs lain.
              Link episode ini tetap aman dan akan dibuka langsung di Facebook.
            </p>
            <a
              href={permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--primary)] px-7 font-black text-white shadow-xl hover:bg-[var(--primary-hover)] active:scale-[0.98]"
              onClick={() => {
                trackEvent("play_intent", { episode_id: episodeId });
                trackEvent("facebook_fallback_click", { episode_id: episodeId });
              }}
              aria-label={`Tonton ${title} di Facebook`}
            >
              ▶ Tonton di Facebook ↗
            </a>
          </div>
        </div>
      </div>

      <p className="px-4 py-3 text-center text-xs leading-5 text-zinc-500 sm:px-1">
        Pemutaran Facebook dibuka di sumber asli untuk menghindari player embed yang tidak tersedia.
      </p>
    </div>
  );
}
