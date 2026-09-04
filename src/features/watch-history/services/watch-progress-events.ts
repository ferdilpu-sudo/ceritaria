"use client";

const EVENT_NAME = "ceritaria-playback-progress";

export interface WatchProgressDetail {
  episodeId: string;
  progressPercent: number;
}

export function emitWatchProgress(detail: WatchProgressDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<WatchProgressDetail>(EVENT_NAME, { detail }));
}

export function subscribeWatchProgress(listener: (detail: WatchProgressDetail) => void) {
  if (typeof window === "undefined") return () => undefined;
  const handler = (event: Event) => {
    const custom = event as CustomEvent<WatchProgressDetail>;
    if (custom.detail) listener(custom.detail);
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
