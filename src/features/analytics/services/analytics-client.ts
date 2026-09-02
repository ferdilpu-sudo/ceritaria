"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const VISITOR_KEY = "ceritaria.analytics.visitor";
const SESSION_KEY = "ceritaria.analytics.session";
const LAST_PAGEVIEW_KEY = "ceritaria.analytics.last-pageview";

function storedUuid(storage: Storage, key: string) {
  const current = storage.getItem(key);
  if (current) return current;
  const value = crypto.randomUUID();
  storage.setItem(key, value);
  return value;
}

export function getAnalyticsIdentity() {
  return {
    visitorId: storedUuid(localStorage, VISITOR_KEY),
    sessionId: storedUuid(sessionStorage, SESSION_KEY),
  };
}

export function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1100) return "tablet";
  return "desktop";
}

export function getReferrerHost() {
  if (!document.referrer) return "direct";
  try {
    return new URL(document.referrer).hostname || "direct";
  } catch {
    return "direct";
  }
}

export function shouldTrackPageview(path: string) {
  const previous = sessionStorage.getItem(LAST_PAGEVIEW_KEY);
  const now = Date.now();
  if (previous) {
    const [lastPath, lastTime] = previous.split("|");
    if (lastPath === path && now - Number(lastTime) < 2000) return false;
  }
  sessionStorage.setItem(LAST_PAGEVIEW_KEY, `${path}|${now}`);
  return true;
}

export async function recordAnalyticsEvent(
  eventName: string,
  path: string,
  metadata: Record<string, string | number> = {},
) {
  try {
    const { visitorId, sessionId } = getAnalyticsIdentity();
    const supabase = createBrowserSupabaseClient();
    await supabase.rpc("track_analytics_event", {
      p_visitor_id: visitorId,
      p_session_id: sessionId,
      p_event_name: eventName,
      p_path: path.slice(0, 512),
      p_referrer: getReferrerHost().slice(0, 255),
      p_device_type: getDeviceType(),
      p_metadata: metadata,
    });
  } catch {
    // Analytics must never interrupt the viewing experience.
  }
}
