"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CommunityAvatar } from "@/features/community/components/CommunityAvatar";
import { CommunityAuthPanel } from "@/features/community/components/CommunityAuthPanel";
import { uploadCommunityAvatar } from "@/features/community/services/upload-community-avatar";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function CommunityProfileEditor() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [joinedAt, setJoinedAt] = useState<string | null>(null);
  const [stats, setStats] = useState({ comments: 0, likes: 0 });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user ?? null;
    setUserId(user?.id ?? null);
    if (!user) return;

    const [{ data: profile }, { data: comments, count }] = await Promise.all([
      supabase.from("community_profiles").select("display_name,bio,avatar_url,created_at").eq("user_id", user.id).maybeSingle(),
      supabase.from("episode_comments").select("like_count", { count: "exact" }).eq("user_id", user.id),
    ]);
    setDisplayName(profile?.display_name ?? "Penonton");
    setBio(profile?.bio ?? "");
    setAvatarUrl(profile?.avatar_url ?? null);
    setJoinedAt(profile?.created_at ?? null);
    setStats({ comments: count ?? 0, likes: (comments ?? []).reduce((sum, item) => sum + item.like_count, 0) });
  }, [supabase]);

  useEffect(() => { void load(); }, [load]);

  async function saveProfile() {
    if (!userId) return;
    const name = displayName.trim();
    if (name.length < 2 || name.length > 32) { setMessage("Nama tampil harus 2–32 karakter."); return; }
    setBusy(true); setMessage("");
    const { error } = await supabase.from("community_profiles").update({ display_name: name, bio: bio.trim().slice(0, 120) }).eq("user_id", userId);
    setMessage(error ? "Profil belum berhasil disimpan." : "Profil tersimpan.");
    if (!error) await load();
    setBusy(false);
  }

  async function changeAvatar(file?: File) {
    if (!file || !userId) return;
    setBusy(true); setMessage("");
    try {
      const publicUrl = await uploadCommunityAvatar(file);
      const { error } = await supabase.from("community_profiles").update({ avatar_url: publicUrl }).eq("user_id", userId);
      if (error) throw error;
      setAvatarUrl(publicUrl);
      setMessage("Foto profil diperbarui.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Foto belum berhasil diperbarui.");
    } finally {
      setBusy(false);
    }
  }

  async function removeAvatar() {
    if (!userId) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.from("community_profiles").update({ avatar_url: null }).eq("user_id", userId);
    if (!error) setAvatarUrl(null);
    setMessage(error ? "Foto belum berhasil dihapus." : "Foto profil dihapus.");
    setBusy(false);
  }

  if (!userId) {
    return <CommunityAuthPanel onAuthenticated={load} />;
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-3xl p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <CommunityAvatar name={displayName || "Penonton"} avatarUrl={avatarUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black sm:text-3xl">{displayName || "Penonton"}</h1>
            <p className="mt-1 text-sm text-zinc-400">{bio || "Belum ada bio."}</p>
            {joinedAt && <p className="mt-2 text-xs text-zinc-500">Bergabung {new Date(joinedAt).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</p>}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[var(--border)] p-4"><p className="text-2xl font-black">{stats.comments}</p><p className="text-xs text-zinc-500">Komentar</p></div>
          <div className="rounded-2xl border border-[var(--border)] p-4"><p className="text-2xl font-black">{stats.likes}</p><p className="text-xs text-zinc-500">Like diterima</p></div>
        </div>
      </section>

      <section className="surface rounded-3xl p-5 sm:p-7">
        <h2 className="text-xl font-black">Edit profil</h2>
        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-2 text-sm font-bold">Foto profil</p>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-red-600 px-4 text-sm font-black text-white">
                {busy ? "Memproses..." : "Pilih foto"}
                <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="sr-only" onChange={(event) => void changeAvatar(event.target.files?.[0])} />
              </label>
              {avatarUrl && <button type="button" disabled={busy} onClick={() => void removeAvatar()} className="min-h-11 rounded-xl border border-[var(--border)] px-4 text-sm font-bold text-zinc-300">Hapus foto</button>}
            </div>
            <p className="mt-2 text-xs text-zinc-500">JPG, PNG, atau WebP. Maksimal 5 MB.</p>
          </div>
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={32} className="w-full rounded-xl border border-[var(--border)] bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500" placeholder="Nama tampil" />
          <textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={120} rows={4} className="w-full resize-none rounded-xl border border-[var(--border)] bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500" placeholder="Bio singkat" />
          <div className="flex items-center justify-between gap-3"><span className="text-xs text-zinc-500">{bio.length}/120</span><button type="button" disabled={busy} onClick={() => void saveProfile()} className="min-h-11 rounded-xl bg-red-600 px-5 text-sm font-black text-white disabled:opacity-60">Simpan</button></div>
          {message && <p className="text-sm text-zinc-300">{message}</p>}
        </div>
      </section>
    </div>
  );
}
