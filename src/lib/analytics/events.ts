"use client";

type EventName =
  | "episode_view"
  | "play_intent"
  | "next_episode_click"
  | "previous_episode_click"
  | "facebook_fallback_click"
  | "youtube_fallback_click";

declare global {
  interface Window { gtag?: (...args: unknown[]) => void; }
}

export function trackEvent(name: EventName, params: Record<string, string | number> = {}) {
  window.gtag?.("event", name, params);
}
