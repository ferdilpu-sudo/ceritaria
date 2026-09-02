"use client";

import { useState } from "react";
import { buildFacebookEmbedUrl } from "@/features/episode/services/facebook-url";
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

function resolveEmbedUrl(provider: VideoProvider, videoUrl: string) {
  if (!videoUrl.trim()) return null;

  try {
    return provider === "youtube"
      ? buildYouTubeEmbedUrl(videoUrl)
      : buildFacebookEmbedUrl(videoUrl);
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
            <p className="mt-3 text-xs font-semibold text-white/60">Menyiapkan video…</p>
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

export function VideoPreview({ provider, videoUrl }: VideoPreviewProps) {
  const embedUrl = resolveEmbedUrl(provider, videoUrl);
  const isYouTube = provider === "youtube";
  const providerName = isYouTube ? "YouTube" : "Facebook";
  const videoId = isYouTube ? getYouTubeVideoId(videoUrl) : null;

  if (!videoUrl.trim()) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-6 text-center">
        <p className="text-sm font-bold text-[var(--text)]">Video belum dimasukkan</p>
        <p className="mt-2 text-sm text-[var(--muted)]">Tempel link video di atas. Setelah itu videonya akan tampil di sini untuk kamu periksa.</p>
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-black text-red-700">Link video belum bisa dibaca</p>
        <p className="mt-2 text-sm text-red-600">
          {isYouTube
            ? "Coba buka video di YouTube lalu salin kembali link videonya."
            : "Pastikan video Facebook dapat dibuka oleh publik, lalu salin kembali link videonya."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[var(--text)]">Cek video</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Putar sebentar untuk memastikan video yang dipilih sudah benar.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${isYouTube ? "border-red-200 bg-red-50 text-red-700" : "border-sky-200 bg-sky-50 text-sky-700"}`}>
            {providerName}
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">✓ Link terbaca</span>
        </div>
      </div>

      {!isYouTube && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Untuk episode baru, sebaiknya gunakan YouTube. Pilihan Facebook disediakan untuk video lama.
        </div>
      )}

      <div className="mx-auto w-full max-w-[300px]">
        <PreviewFrame key={embedUrl} embedUrl={embedUrl} providerName={providerName} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4 text-xs">
        <div>
          <span className="font-bold text-emerald-700">Video siap digunakan</span>
          {videoId && <span className="ml-2 text-[var(--muted)]">YouTube #{videoId}</span>}
        </div>
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="min-h-11 rounded-lg px-2 py-3 font-bold text-[var(--muted)] hover:text-[var(--text)]">
          Buka videonya ↗
        </a>
      </div>
    </div>
  );
}
