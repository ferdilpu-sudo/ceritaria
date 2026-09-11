"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MediaImage } from "@/components/ui/MediaImage";
import { buildTeleCloudShareUrl, normalizeTeleCloudVideoUrl } from "@/features/episode/services/telecloud-url";
import { emitWatchProgress } from "@/features/watch-history/services/watch-progress-events";
import { getResumeProgress } from "@/features/watch-history/services/watch-history";
import { trackEvent } from "@/lib/analytics/events";

interface Props {
  videoUrl: string;
  thumbnailUrl: string | null;
  title: string;
  episodeId: string;
  seriesSlug: string;
  episodeSlug: string;
  autoStart?: boolean;
  nextHref?: string;
  nextTitle?: string;
}

function progressOf(video: HTMLVideoElement) {
  return video.duration > 0 ? Math.min(100, Math.max(0, (video.currentTime / video.duration) * 100)) : 0;
}

export function TeleCloudVideoEmbed({ videoUrl, thumbnailUrl, title, episodeId, seriesSlug, episodeSlug, autoStart = false, nextHref, nextTitle }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastProgressSave = useRef(0);
  const [loaded, setLoaded] = useState(autoStart);
  const [errored, setErrored] = useState(false);
  const [ended, setEnded] = useState(false);
  const [countdown, setCountdown] = useState(6);
  const [autoNext, setAutoNext] = useState(true);
  const streamUrl = normalizeTeleCloudVideoUrl(videoUrl);
  const shareUrl = buildTeleCloudShareUrl(videoUrl);

  useEffect(() => {
    if (!ended || !nextHref || !autoNext) return;
    if (countdown <= 0) {
      router.push(`${nextHref}?play=1`);
      return;
    }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [autoNext, countdown, ended, nextHref, router]);

  const saveProgress = (video: HTMLVideoElement) => {
    emitWatchProgress({ episodeId, progressPercent: progressOf(video) });
  };

  const startPlayback = () => {
    trackEvent("play_intent", { episode_id: episodeId, provider: "telecloud" });
    setLoaded(true);
  };

  return (
    <div className="mx-auto w-full max-w-none sm:max-w-[380px] lg:mx-0">
      <div className="relative aspect-[9/16] overflow-hidden rounded-none border-y border-white/10 bg-black sm:rounded-[26px] sm:border sm:shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
        {!loaded ? (
          <>
            <MediaImage src={thumbnailUrl} alt={`Thumbnail ${title}`} sizes="(max-width: 639px) 100vw, 380px" />
            <div className="absolute inset-0 bg-black/30" />
            <button type="button" onClick={startPlayback} className="absolute left-1/2 top-1/2 min-h-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-6 font-black text-black shadow-2xl">▶ Putar episode</button>
          </>
        ) : (
          <>
            <video
              ref={videoRef}
              className="h-full w-full bg-black object-contain"
              src={streamUrl}
              poster={thumbnailUrl ?? undefined}
              controls
              playsInline
              preload="metadata"
              autoPlay
              onLoadedMetadata={(event) => {
                const video = event.currentTarget;
                const progress = getResumeProgress(seriesSlug, episodeSlug);
                if (progress > 0 && progress < 98 && video.duration > 0) video.currentTime = (video.duration * progress) / 100;
              }}
              onPlay={() => { setEnded(false); setErrored(false); }}
              onPause={(event) => saveProgress(event.currentTarget)}
              onTimeUpdate={(event) => {
                const now = Date.now();
                if (now - lastProgressSave.current < 5000) return;
                lastProgressSave.current = now;
                saveProgress(event.currentTarget);
              }}
              onEnded={() => {
                emitWatchProgress({ episodeId, progressPercent: 100 });
                setEnded(true);
                setCountdown(6);
                setAutoNext(true);
              }}
              onError={() => setErrored(true)}
            />
            {errored && <div className="absolute inset-0 z-20 grid place-items-center bg-black/90 p-6 text-center"><div><p className="font-bold">Video belum bisa dimuat.</p><button type="button" className="mt-4 min-h-11 rounded-xl border border-white/20 px-4 text-sm font-bold" onClick={() => { setErrored(false); videoRef.current?.load(); }}>Coba lagi</button></div></div>}
            {ended && !errored && <div className="absolute inset-0 z-20 grid place-items-center bg-black/85 p-6 text-center"><div><p className="text-sm font-bold text-red-300">EPISODE SELESAI</p><h3 className="mt-2 text-xl font-black">{nextHref ? "Lanjut ke episode berikutnya" : "Kamu sudah sampai episode terakhir"}</h3>{nextHref && <><p className="mt-2 text-sm text-zinc-300">{nextTitle ?? "Episode berikutnya"}{autoNext ? ` · otomatis dalam ${countdown} detik` : ""}</p><div className="mt-5 flex flex-col gap-2"><Link href={`${nextHref}?play=1`} className="min-h-12 rounded-xl bg-red-600 px-5 py-3 font-black text-white">▶ Lanjut sekarang</Link>{autoNext && <button type="button" onClick={() => setAutoNext(false)} className="min-h-11 rounded-xl border border-white/15 px-4 text-sm font-bold text-zinc-300">Batalkan lanjut otomatis</button>}</div></>}</div></div>}
          </>
        )}
      </div>
      <div className="flex min-h-11 items-center justify-end px-1 text-xs"><a href={shareUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg px-2 font-bold text-zinc-400 hover:text-white" onClick={() => trackEvent("telecloud_fallback_click", { episode_id: episodeId })}>Buka sumber video ↗</a></div>
    </div>
  );
}
