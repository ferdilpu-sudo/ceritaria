"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MediaImage } from "@/components/ui/MediaImage";
import { loadYouTubeIframeApi, type YouTubePlayer } from "@/features/episode/services/youtube-iframe-api";
import { buildYouTubeEmbedUrl } from "@/features/episode/services/youtube-url";
import { emitWatchProgress } from "@/features/watch-history/services/watch-progress-events";
import { trackEvent } from "@/lib/analytics/events";

interface Props {
  videoUrl: string;
  thumbnailUrl: string | null;
  title: string;
  episodeId: string;
  autoStart?: boolean;
  nextHref?: string;
  nextTitle?: string;
}

function progressOf(player: YouTubePlayer) {
  const duration = player.getDuration();
  return duration > 0 ? Math.min(100, Math.max(0, (player.getCurrentTime() / duration) * 100)) : 0;
}

export function YouTubeVideoEmbed({ videoUrl, thumbnailUrl, title, episodeId, autoStart = false, nextHref, nextTitle }: Props) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loaded, setLoaded] = useState(autoStart);
  const [frameReady, setFrameReady] = useState(false);
  const [ended, setEnded] = useState(false);
  const [countdown, setCountdown] = useState(6);
  const [autoNext, setAutoNext] = useState(true);

  useEffect(() => {
    if (!loaded || !iframeRef.current) return;
    let cancelled = false;
    const stopProgress = () => { if (progressTimer.current) clearInterval(progressTimer.current); progressTimer.current = null; };
    const saveProgress = (player: YouTubePlayer) => emitWatchProgress({ episodeId, progressPercent: progressOf(player) });

    void loadYouTubeIframeApi().then((api) => {
      if (cancelled || !iframeRef.current) return;
      playerRef.current = new api.Player(iframeRef.current, {
        events: {
          onReady: () => setFrameReady(true),
          onStateChange: (event) => {
            if (event.data === api.PlayerState.PLAYING) {
              setEnded(false); stopProgress(); saveProgress(event.target);
              progressTimer.current = setInterval(() => saveProgress(event.target), 5000);
            } else if (event.data === api.PlayerState.PAUSED) {
              stopProgress(); saveProgress(event.target);
            } else if (event.data === api.PlayerState.ENDED) {
              stopProgress(); emitWatchProgress({ episodeId, progressPercent: 100 });
              setEnded(true); setCountdown(6); setAutoNext(true);
            }
          },
        },
      });
    }).catch(() => setFrameReady(true));

    return () => {
      cancelled = true; stopProgress();
      try { playerRef.current?.destroy(); } catch { /* iframe may already be gone */ }
      playerRef.current = null;
    };
  }, [loaded, episodeId]);

  useEffect(() => {
    if (!ended || !nextHref || !autoNext) return;
    if (countdown <= 0) { router.push(`${nextHref}?play=1`); return; }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [ended, nextHref, autoNext, countdown, router]);

  const startPlayback = () => { trackEvent("play_intent", { episode_id: episodeId }); setLoaded(true); };

  return (
    <div className="mx-auto w-full max-w-none sm:max-w-[380px] lg:mx-0">
      <div className="relative aspect-[9/16] overflow-hidden rounded-none border-y border-white/10 bg-black sm:rounded-[26px] sm:border sm:shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
        {!loaded ? (
          <><MediaImage src={thumbnailUrl} alt={`Thumbnail ${title}`} sizes="(max-width: 639px) 100vw, 380px" /><div className="absolute inset-0 bg-black/30" />
            <button type="button" onClick={startPlayback} className="absolute left-1/2 top-1/2 min-h-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-6 font-black text-black shadow-2xl">▶ Putar episode</button></>
        ) : (
          <>
            {!frameReady && <div className="absolute inset-0 z-10 grid place-items-center bg-zinc-950"><div className="text-center"><span className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white" /><p className="mt-4 text-sm font-semibold text-white/70">Menyiapkan video…</p></div></div>}
            <iframe ref={iframeRef} title={`YouTube player ${title}`} src={buildYouTubeEmbedUrl(videoUrl, true)} className="h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="eager" referrerPolicy="strict-origin-when-cross-origin" />
            {ended && <div className="absolute inset-0 z-20 grid place-items-center bg-black/85 p-6 text-center"><div><p className="text-sm font-bold text-red-300">EPISODE SELESAI</p><h3 className="mt-2 text-xl font-black">{nextHref ? "Lanjut ke episode berikutnya" : "Kamu sudah sampai episode terakhir"}</h3>{nextHref && <><p className="mt-2 text-sm text-zinc-300">{nextTitle ?? "Episode berikutnya"}{autoNext ? ` · otomatis dalam ${countdown} detik` : ""}</p><div className="mt-5 flex flex-col gap-2"><Link href={`${nextHref}?play=1`} className="min-h-12 rounded-xl bg-red-600 px-5 py-3 font-black text-white">▶ Lanjut sekarang</Link>{autoNext && <button type="button" onClick={() => setAutoNext(false)} className="min-h-11 rounded-xl border border-white/15 px-4 text-sm font-bold text-zinc-300">Batalkan lanjut otomatis</button>}</div></>}</div></div>}
          </>
        )}
      </div>
      <div className="flex min-h-11 items-center justify-end px-1 text-xs"><a href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg px-2 font-bold text-zinc-400 hover:text-white" onClick={() => trackEvent("youtube_fallback_click", { episode_id: episodeId })}>Buka di YouTube ↗</a></div>
    </div>
  );
}
