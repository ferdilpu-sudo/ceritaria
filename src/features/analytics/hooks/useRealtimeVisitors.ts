"use client";

import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { AnalyticsPoint, RealtimeVisitorSnapshot } from "@/features/analytics/types/analytics";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const CHANNEL = "ceritaria-public-visitors";
const EMPTY: RealtimeVisitorSnapshot = { onlineCount: 0, paths: [], devices: [] };

type PresenceMeta = { path?: unknown; device?: unknown };
type PresenceState = Record<string, PresenceMeta[]>;

function countBy(items: string[]): AnalyticsPoint[] {
  const counts = new Map<string, number>();
  items.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function snapshot(channel: RealtimeChannel): RealtimeVisitorSnapshot {
  const state = channel.presenceState() as unknown as PresenceState;
  const visitors = Object.values(state).map((metas) => metas.at(-1) ?? {});
  const paths = visitors.map((meta) => typeof meta.path === "string" ? meta.path : "/");
  const devices = visitors.map((meta) => typeof meta.device === "string" ? meta.device : "unknown");
  return { onlineCount: Object.keys(state).length, paths: countBy(paths), devices: countBy(devices) };
}

export function useRealtimeVisitors() {
  const [data, setData] = useState<RealtimeVisitorSnapshot>(EMPTY);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const channel = supabase.channel(CHANNEL);
    channel.on("presence", { event: "sync" }, () => setData(snapshot(channel))).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  return data;
}
