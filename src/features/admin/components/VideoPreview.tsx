"use client";

import { FacebookXfbmlFrame } from "@/features/episode/components/FacebookXfbmlFrame";
import { facebookPermalinkSchema, isFacebookShareUrl } from "@/features/episode/services/facebook-url";
import { buildTeleCloudShareUrl, getTeleCloudStreamUrl } from "@/features/episode/services/telecloud-url";
import { buildYouTubeEmbedUrl } from "@/features/episode/services/youtube-url";
import type { VideoProvider } from "@/types/database.types";

interface VideoPreviewProps {
  provider: VideoProvider;
  videoUrl: string;
}

function resolveYouTubeEmbedUrl(videoUrl: string) {
  if (!videoUrl.trim()) return null;

  try {
    return buildYouTubeEmbedUrl(videoUrl);
  } catch {
    return null;
  }
}

function YouTubePreviewFrame({ embedUrl }: { embedUrl: string }) {
  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-[22px] border border-zinc-200 bg-black shadow-lg">
      <iframe
        title="Preview YouTube"
        src={embedUrl}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

export function VideoPreview({ provider, videoUrl }: VideoPreviewProps) {
  const isTeleCloud = provider === "telecloud";
  const isYouTube = provider === "youtube";
  const isFacebook = provider === "facebook";
  const isFacebookShare = isFacebook && isFacebookShareUrl(videoUrl);
  const teleCloudStreamUrl = isTeleCloud ? getTeleCloudStreamUrl(videoUrl) : null;
  const youtubeEmbedUrl = isYouTube ? resolveYouTubeEmbedUrl(videoUrl) : null;
  const isFacebookValid = isFacebook && facebookPermalinkSchema.safeParse(videoUrl).success;
  const providerName = isTeleCloud ? "TeleCloud" : isYouTube ? "YouTube" : "Facebook";
  const isValid = isTeleCloud
    ? teleCloudStreamUrl !== null
    : isYouTube
      ? youtubeEmbedUrl !== null
      : isFacebookValid && !isFacebookShare;

  if (!videoUrl.trim()) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-6 text-center">
        <p className="text-sm font-bold text-[var(--text)]">Video belum dimasukkan</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Tempel link video di atas. Setelah itu videonya akan tampil di sini untuk kamu periksa.
        </p>
      </div>
    );
  }

  if (isFacebookShare) {
    return (
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
        <p className="text-sm font-black text-sky-800">Link share Facebook dikenali</p>
        <p className="mt-2 text-sm leading-6 text-sky-700">
          Saat episode disimpan, Ceritaria akan mengubah link share ini ke permalink Reel/video final secara otomatis.
          Preview akan normal setelah link final tersimpan.
        </p>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 items-center rounded-lg px-2 py-3 text-sm font-bold text-sky-800"
        >
          Buka link Facebook ↗
        </a>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-black text-red-700">Link video belum bisa dibaca</p>
        <p className="mt-2 text-sm text-red-600">
          {isTeleCloud
            ? "Gunakan link share publik TeleCloud yang berbentuk https://tele.flyonz.web.id/s/..."
            : isYouTube
              ? "Coba buka video di YouTube lalu salin kembali link videonya."
              : "Pastikan video Facebook dapat dibuka oleh publik, lalu salin kembali link Reel atau videonya."}
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
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${isTeleCloud ? "border-emerald-200 bg-emerald-50 text-emerald-700" : isYouTube ? "border-red-200 bg-red-50 text-red-700" : "border-sky-200 bg-sky-50 text-sky-700"}`}>
            {providerName}
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            ✓ Link terbaca
          </span>
        </div>
      </div>

      {isFacebook && (
        <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-700">
          Facebook Reel/video dirender dengan player resmi Meta. Konten harus berstatus Public agar dapat diputar.
        </div>
      )}

      {isTeleCloud && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
          Link share TeleCloud akan disimpan sebagai endpoint streaming publik /stream.
        </div>
      )}

      <div className="mx-auto w-full max-w-[300px]">
        {teleCloudStreamUrl ? (
          <video
            className="aspect-[9/16] w-full rounded-[22px] border border-zinc-200 bg-black shadow-lg"
            src={teleCloudStreamUrl}
            controls
            playsInline
            preload="metadata"
          />
        ) : youtubeEmbedUrl ? (
          <YouTubePreviewFrame embedUrl={youtubeEmbedUrl} />
        ) : (
          <FacebookXfbmlFrame
            permalink={videoUrl}
            width={300}
            className="relative aspect-[9/16] overflow-hidden rounded-[22px] border border-zinc-200 bg-black shadow-lg"
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4 text-xs">
        <span className="font-bold text-emerald-700">✓ Video siap digunakan</span>
        <a
          href={teleCloudStreamUrl ? buildTeleCloudShareUrl(videoUrl) : videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-11 rounded-lg px-2 py-3 font-bold text-[var(--muted)] hover:text-[var(--text)]"
        >
          Buka videonya ↗
        </a>
      </div>
    </div>
  );
}
