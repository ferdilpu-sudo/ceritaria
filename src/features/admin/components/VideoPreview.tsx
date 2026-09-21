"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { facebookPermalinkSchema } from "@/features/episode/services/facebook-url";
import { buildYouTubeEmbedUrl, getYouTubeVideoId } from "@/features/episode/services/youtube-url";
import type { VideoProvider } from "@/types/database.types";

interface VideoPreviewProps {
  provider: VideoProvider;
  videoUrl: string;
}

interface PreviewFrameProps {
  embedUrl: string;
  providerName: string;
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

function resolveYouTubeEmbedUrl(videoUrl: string) {
  if (!videoUrl.trim()) return null;

  try {
    return buildYouTubeEmbedUrl(videoUrl);
  } catch {
    return null;
  }
}

function PreviewFrame({ embedUrl, providerName }: PreviewFrameProps) {
  const [ready, setReady] = useState(false);

  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-[22px] border border-zinc-200 bg-black shadow-lg">
      {!ready && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-zinc-950" role="status">
          <div className="text-center">
            <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="mt-3 text-xs font-semibold text-white/60">Memuat preview…</p>
          </div>
        </div>
      )}
      <iframe
        title={`Preview ${providerName}`}
        src={embedUrl}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setReady(true)}
      />
    </div>
  );
}

function FacebookPreviewFrame({ permalink }: { permalink: string }) {
  const embedRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => parseFacebookEmbed(embedRootRef.current), 0);
    return () => window.clearTimeout(timer);
  }, [permalink]);

  return (
    <>
      <div
        ref={embedRootRef}
        className="relative aspect-[9/16] overflow-hidden rounded-[22px] border border-zinc-200 bg-black shadow-lg"
      >
        <div
          className="fb-video h-full w-full"
          data-href={permalink}
          data-width="300"
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
    </>
  );
}

export function VideoPreview({ provider, videoUrl }: VideoPreviewProps) {
  const isYouTube = provider === "youtube";
  const providerName = isYouTube ? "YouTube" : "Facebook";
  const youtubeEmbedUrl = isYouTube ? resolveYouTubeEmbedUrl(videoUrl) : null;
  const isFacebookValid = !isYouTube && facebookPermalinkSchema.safeParse(videoUrl).success;
  const isValid = isYouTube ? youtubeEmbedUrl !== null : isFacebookValid;
  const videoId = isYouTube ? getYouTubeVideoId(videoUrl) : null;

  if (!videoUrl.trim()) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-6 text-center">
        <p className="text-sm font-bold text-[var(--text)]">Preview video</p>
        <p className="mt-2 text-sm text-[var(--muted)]">Tempel URL {providerName} untuk mengecek player sebelum disimpan.</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-black text-red-700">URL {providerName} belum valid</p>
        <p className="mt-2 text-sm text-red-600">
          {isYouTube
            ? "Gunakan link watch, youtu.be, Shorts, live, atau embed dengan HTTPS."
            : "Gunakan permalink Reel atau video Facebook Public dengan HTTPS."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[var(--text)]">Preview player</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Pastikan video yang benar sebelum episode dipublikasikan.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${isYouTube ? "border-red-200 bg-red-50 text-red-700" : "border-sky-200 bg-sky-50 text-sky-700"}`}>
            {providerName}
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">✓ URL valid</span>
        </div>
      </div>

      {!isYouTube && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Facebook Reel/video dirender dengan Meta SDK. Pastikan konten berstatus Public agar player dapat dimuat.
        </div>
      )}

      <div className="mx-auto w-full max-w-[300px]">
        {isYouTube && youtubeEmbedUrl ? (
          <PreviewFrame key={youtubeEmbedUrl} embedUrl={youtubeEmbedUrl} providerName={providerName} />
        ) : (
          <FacebookPreviewFrame permalink={videoUrl} />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4 text-xs">
        <div>
          <span className="text-[var(--muted)]">Status: </span>
          <span className="font-bold text-emerald-700">siap dipreview</span>
          {videoId && <span className="ml-2 text-[var(--muted)]">ID {videoId}</span>}
        </div>
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="min-h-11 rounded-lg px-2 py-3 font-bold text-[var(--muted)] hover:text-[var(--text)]">
          Buka sumber ↗
        </a>
      </div>
    </div>
  );
}
