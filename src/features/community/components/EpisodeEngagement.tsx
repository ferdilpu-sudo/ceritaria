"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type ReactionKey = "love" | "shock" | "sad" | "angry";
type Poll = { id: string; question: string; is_active: boolean };
type PollOption = { id: string; label: string; vote_count: number; sort_order: number };

const reactions: Array<{ key: ReactionKey; emoji: string; label: string }> = [
  { key: "love", emoji: "❤️", label: "Baper" },
  { key: "shock", emoji: "😱", label: "Kaget" },
  { key: "sad", emoji: "😭", label: "Sedih" },
  { key: "angry", emoji: "😡", label: "Kesal" },
];

export function EpisodeEngagement({ episodeId }: { episodeId: string }) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [counts, setCounts] = useState<Record<ReactionKey, number>>({ love: 0, shock: 0, sad: 0, angry: 0 });
  const [mine, setMine] = useState<ReactionKey | null>(null);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [{ data: reactionRows }, { data: claims }] = await Promise.all([
      supabase.from("episode_reactions").select("reaction").eq("episode_id", episodeId),
      supabase.auth.getClaims(),
    ]);
    const next = { love: 0, shock: 0, sad: 0, angry: 0 } as Record<ReactionKey, number>;
    (reactionRows ?? []).forEach((row) => { const key = row.reaction as ReactionKey; if (key in next) next[key] += 1; });
    setCounts(next);

    const userId = claims.data?.claims?.sub;
    if (userId) {
      const { data } = await supabase.from("episode_reactions").select("reaction").eq("episode_id", episodeId).eq("user_id", userId).maybeSingle();
      setMine((data?.reaction as ReactionKey | undefined) ?? null);
    }

    const { data: pollRow } = await supabase.from("episode_polls").select("id,question,is_active").eq("episode_id", episodeId).maybeSingle();
    if (!pollRow) { setPoll(null); setOptions([]); return; }
    setPoll(pollRow);
    const { data: optionRows } = await supabase.from("episode_poll_options").select("id,label,vote_count,sort_order").eq("poll_id", pollRow.id).order("sort_order");
    setOptions(optionRows ?? []);
    if (userId) {
      const { data: vote } = await supabase.from("episode_poll_votes").select("option_id").eq("poll_id", pollRow.id).eq("user_id", userId).maybeSingle();
      setMyVote(vote?.option_id ?? null);
    }
  }, [episodeId, supabase]);

  useEffect(() => { void load(); }, [load]);

  async function react(key: ReactionKey) {
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;
    if (!userId) { setMessage("Masuk ke akun untuk memberi reaksi."); return; }
    setBusy(true); setMessage("");
    if (mine === key) await supabase.from("episode_reactions").delete().eq("episode_id", episodeId).eq("user_id", userId);
    else await supabase.from("episode_reactions").upsert({ episode_id: episodeId, user_id: userId, reaction: key }, { onConflict: "episode_id,user_id" });
    await load(); setBusy(false);
  }

  async function vote(optionId: string) {
    if (!poll || myVote || !poll.is_active) return;
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;
    if (!userId) { setMessage("Masuk ke akun untuk ikut prediksi."); return; }
    setBusy(true); setMessage("");
    const { error } = await supabase.from("episode_poll_votes").insert({ poll_id: poll.id, option_id: optionId, user_id: userId });
    if (error) setMessage("Pilihan belum tersimpan. Coba lagi.");
    await load(); setBusy(false);
  }

  const totalVotes = options.reduce((sum, item) => sum + item.vote_count, 0);

  return (
    <section className="mt-8 space-y-6 border-t border-[var(--border)] pt-7 sm:mt-10 sm:pt-8">
      <div>
        <p className="text-[10px] font-black tracking-[0.18em] text-red-400 sm:text-xs">REAKSI PENONTON</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {reactions.map((item) => (
            <button key={item.key} type="button" disabled={busy} onClick={() => void react(item.key)}
              className={`min-h-14 rounded-2xl border px-3 py-2 text-left transition ${mine === item.key ? "border-red-500 bg-red-950/40" : "border-[var(--border)] bg-[var(--surface)] hover:border-zinc-600"}`}>
              <span className="text-xl" aria-hidden="true">{item.emoji}</span>
              <span className="ml-2 text-sm font-bold">{item.label}</span>
              <span className="ml-2 text-xs text-zinc-400">{counts[item.key]}</span>
            </button>
          ))}
        </div>
      </div>

      {poll && (
        <div className="surface rounded-2xl p-4 sm:p-5">
          <p className="text-[10px] font-black tracking-[0.18em] text-red-400">PREDIKSI PENONTON</p>
          <h2 className="mt-2 text-lg font-black sm:text-xl">{poll.question}</h2>
          <div className="mt-4 space-y-2">
            {options.map((option) => {
              const percent = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
              const reveal = Boolean(myVote) || !poll.is_active;
              return (
                <button key={option.id} type="button" disabled={busy || Boolean(myVote) || !poll.is_active} onClick={() => void vote(option.id)}
                  className={`relative min-h-12 w-full overflow-hidden rounded-xl border px-4 py-3 text-left ${myVote === option.id ? "border-red-500" : "border-[var(--border)]"}`}>
                  {reveal && <span className="absolute inset-y-0 left-0 bg-white/5" style={{ width: `${percent}%` }} />}
                  <span className="relative flex items-center justify-between gap-3 text-sm font-bold">
                    <span>{option.label}</span>{reveal && <span className="text-zinc-400">{percent}%</span>}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-zinc-500">{totalVotes} suara{myVote ? " · Pilihanmu sudah terkunci" : ""}</p>
        </div>
      )}
      {message && <p className="text-sm font-bold text-amber-300">{message}</p>}
    </section>
  );
}
