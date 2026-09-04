"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type NotificationRow = {
  id: string;
  actor_user_id: string;
  episode_id: string;
  is_read: boolean;
  created_at: string;
};

type EpisodeInfo = { id: string; title: string; slug: string; series_id: string };
type SeriesInfo = { id: string; slug: string };

export function CommunityUserMenu({ userId }: { userId: string }) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [panel, setPanel] = useState<"profile" | "notifications" | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [actorNames, setActorNames] = useState<Map<string, string>>(new Map());
  const [episodes, setEpisodes] = useState<Map<string, EpisodeInfo>>(new Map());
  const [series, setSeries] = useState<Map<string, SeriesInfo>>(new Map());
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [{ data: profile }, { data: notificationRows }] = await Promise.all([
      supabase.from("community_profiles").select("display_name,bio").eq("user_id", userId).maybeSingle(),
      supabase.from("community_notifications").select("id,actor_user_id,episode_id,is_read,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    ]);
    setDisplayName(profile?.display_name ?? "Penonton");
    setBio(profile?.bio ?? "");
    const rows = (notificationRows ?? []) as NotificationRow[];
    setNotifications(rows);

    const actorIds = [...new Set(rows.map((item) => item.actor_user_id))];
    const episodeIds = [...new Set(rows.map((item) => item.episode_id))];
    const [{ data: actors }, { data: episodeRows }] = await Promise.all([
      actorIds.length ? supabase.from("community_profiles").select("user_id,display_name").in("user_id", actorIds) : Promise.resolve({ data: [] }),
      episodeIds.length ? supabase.from("episodes").select("id,title,slug,series_id").in("id", episodeIds) : Promise.resolve({ data: [] }),
    ]);
    setActorNames(new Map((actors ?? []).map((item) => [item.user_id, item.display_name])));
    const typedEpisodes = (episodeRows ?? []) as EpisodeInfo[];
    setEpisodes(new Map(typedEpisodes.map((item) => [item.id, item])));

    const seriesIds = [...new Set(typedEpisodes.map((item) => item.series_id))];
    const { data: seriesRows } = seriesIds.length
      ? await supabase.from("series").select("id,slug").in("id", seriesIds)
      : { data: [] };
    setSeries(new Map(((seriesRows ?? []) as SeriesInfo[]).map((item) => [item.id, item])));
  }, [supabase, userId]);

  useEffect(() => { void load(); }, [load]);

  async function saveProfile() {
    const name = displayName.trim();
    if (name.length < 2 || name.length > 32) { setMessage("Nama tampil harus 2–32 karakter."); return; }
    setBusy(true); setMessage("");
    const { error } = await supabase.from("community_profiles").update({ display_name: name, bio: bio.trim().slice(0, 120) }).eq("user_id", userId);
    setMessage(error ? "Profil belum berhasil disimpan." : "Profil tersimpan.");
    setBusy(false);
  }

  async function markRead() {
    const unreadIds = notifications.filter((item) => !item.is_read).map((item) => item.id);
    if (!unreadIds.length) return;
    await supabase.from("community_notifications").update({ is_read: true }).in("id", unreadIds).eq("user_id", userId);
    await load();
  }

  const unread = notifications.filter((item) => !item.is_read).length;

  return (
    <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><p className="text-xs text-zinc-500">Masuk sebagai</p><p className="font-black">{displayName || "Penonton"}</p></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPanel(panel === "profile" ? null : "profile")} className="min-h-11 rounded-xl border border-[var(--border)] px-3 text-sm font-bold">Profil</button>
          <button type="button" onClick={() => setPanel(panel === "notifications" ? null : "notifications")} className="min-h-11 rounded-xl border border-[var(--border)] px-3 text-sm font-bold">
            Notifikasi{unread ? ` ${unread}` : ""}
          </button>
        </div>
      </div>

      {panel === "profile" && (
        <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={32} className="w-full rounded-xl border border-[var(--border)] bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500" placeholder="Nama tampil" />
          <textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={120} rows={3} className="w-full resize-none rounded-xl border border-[var(--border)] bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500" placeholder="Bio singkat, misalnya: Tim Ana sejak episode 1" />
          <div className="flex items-center justify-between gap-3"><span className="text-xs text-zinc-500">{bio.length}/120</span><button type="button" disabled={busy} onClick={() => void saveProfile()} className="min-h-11 rounded-xl bg-red-600 px-4 text-sm font-black text-white disabled:opacity-60">Simpan profil</button></div>
          {message && <p className="text-sm text-zinc-300">{message}</p>}
        </div>
      )}

      {panel === "notifications" && (
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <div className="flex items-center justify-between gap-3"><p className="font-black">Balasan terbaru</p>{unread > 0 && <button type="button" onClick={() => void markRead()} className="min-h-10 text-xs font-bold text-red-300">Tandai dibaca</button>}</div>
          {notifications.length === 0 ? <p className="mt-3 text-sm text-zinc-500">Belum ada notifikasi.</p> : (
            <div className="mt-2 space-y-1">
              {notifications.map((item) => {
                const episode = episodes.get(item.episode_id);
                const seriesInfo = episode ? series.get(episode.series_id) : undefined;
                const href = episode && seriesInfo ? `/series/${seriesInfo.slug}/${episode.slug}#comments-title` : null;
                const content = <><span className="font-bold">{actorNames.get(item.actor_user_id) ?? "Seseorang"}</span> membalas komentarmu{episode ? ` di ${episode.title}` : ""}.</>;
                return href ? <Link key={item.id} href={href} className={`block rounded-xl px-3 py-3 text-sm leading-5 ${item.is_read ? "text-zinc-400" : "bg-red-950/20 text-zinc-100"}`}>{content}</Link> : <p key={item.id} className="rounded-xl px-3 py-3 text-sm text-zinc-400">{content}</p>;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
