"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  getAnalyticsIdentity,
  getDeviceType,
  recordAnalyticsEvent,
  shouldTrackPageview,
} from "@/features/analytics/services/analytics-client";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const PRESENCE_CHANNEL = "ceritaria-public-visitors";

export function PublicAnalyticsTracker() {
  const pathname = usePathname();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const { sessionId } = getAnalyticsIdentity();
    const supabase = createBrowserSupabaseClient();
    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: sessionId } },
    });

    channel.subscribe(async (status) => {
      if (status !== "SUBSCRIBED") return;
      await channel.track({
        path: window.location.pathname,
        device: getDeviceType(),
        online_at: new Date().toISOString(),
      });
    });
    channelRef.current = channel;

    return () => {
      void channel.untrack();
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (shouldTrackPageview(pathname)) {
      void recordAnalyticsEvent("page_view", pathname);
    }
    void channelRef.current?.track({
      path: pathname,
      device: getDeviceType(),
      online_at: new Date().toISOString(),
    });
  }, [pathname]);

  return null;
}
