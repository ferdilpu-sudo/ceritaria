"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { CommentComposer } from "@/features/community/components/CommentComposer";
import { CommentItem } from "@/features/community/components/CommentItem";
import { CommunityAuthPanel } from "@/features/community/components/CommunityAuthPanel";
import type { CommunityComment, CommunityProfile } from "@/features/community/types/community";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface Props { episodeId: string }

export function EpisodeComments({ episodeId }: Props) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [profiles, setProfiles] = useState<Map<string, CommunityProfile>>(new Map());
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    const activeUser = authData.user ?? null;
    setUser(activeUser);

    const { data, error } = await supabase
      .from("episode_comments")
      .select("id,episode_id,user_id,parent_id,body,like_count,created_at")
      .eq("episode_id", episodeId)
      .order("created_at", { ascending: true })
      .limit(100);
    if (error) {
      setNotice("Komentar belum bisa dimuat.");
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as CommunityComment[];
    setComments(rows);
    const userIds = [...new Set(rows.map((item) => item.user_id))];
    if (userIds.length) {
      const { data: profileRows } = await supabase.from("community_profiles").select("user_id,display_name,avatar_url").in("user_id", userIds);
      setProfiles(new Map(((profileRows ?? []) as CommunityProfile[]).map((item) => [item.user_id, item])));
    } else setProfiles(new Map());

    if (activeUser && rows.length) {
      const { data: likes } = await supabase.from("comment_likes").select("comment_id").eq("user_id", activeUser.id).in("comment_id", rows.map((item) => item.id));
      setLiked(new Set((likes ?? []).map((item) => item.comment_id)));
    } else setLiked(new Set());
    setLoading(false);
  }, [episodeId, supabase]);

  useEffect(() => { void load(); }, [load]);

  async function createComment(body: string, parentId: string | null = null) {
    if (!user) throw new Error("Masuk terlebih dahulu.");
    const { error } = await supabase.from("episode_comments").insert({ episode_id: episodeId, user_id: user.id, parent_id: parentId, body });
    if (error) throw new Error(error.message);
    await load();
  }

  async function toggleLike(commentId: string) {
    if (!user) return;
    if (liked.has(commentId)) {
      await supabase.from("comment_likes").delete().eq("comment_id", commentId).eq("user_id", user.id);
    } else {
      await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: user.id });
    }
    await load();
  }

  async function deleteComment(commentId: string) {
    const { error } = await supabase.rpc("delete_own_comment", { p_comment_id: commentId });
    setNotice(error ? "Komentar gagal dihapus." : "Komentar dihapus.");
    if (!error) await load();
  }

  async function reportComment(commentId: string) {
    if (!user) return;
    const { error } = await supabase.from("comment_reports").insert({ comment_id: commentId, user_id: user.id, reason: "Tidak pantas" });
    setNotice(error?.code === "23505" ? "Komentar ini sudah pernah kamu laporkan." : error ? "Laporan gagal dikirim." : "Laporan terkirim. Terima kasih.");
  }

  const topLevel = comments.filter((item) => !item.parent_id);
  const repliesByParent = new Map<string, CommunityComment[]>();
  comments.filter((item) => item.parent_id).forEach((item) => {
    const key = item.parent_id!;
    repliesByParent.set(key, [...(repliesByParent.get(key) ?? []), item]);
  });

  return (
    <section className="mx-auto mt-10 max-w-3xl border-t border-[var(--border)] pt-8 sm:mt-14 sm:pt-10" aria-labelledby="comments-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black tracking-[0.18em] text-red-400 sm:text-xs">KOMUNITAS</p>
          <h2 id="comments-title" className="mt-1 text-2xl font-black sm:text-3xl">Komentar <span className="text-zinc-500">{comments.length}</span></h2>
        </div>
        {user && (
          <button onClick={async () => { await supabase.auth.signOut(); await load(); }} className="min-h-11 rounded-xl px-3 text-sm font-bold text-zinc-400 hover:text-white">Keluar</button>
        )}
      </div>

      <div className="mt-5">
        {user ? <CommentComposer onSubmit={(body) => createComment(body)} /> : <CommunityAuthPanel onAuthenticated={load} />}
      </div>
      {notice && <p className="mt-3 text-sm text-zinc-300">{notice}</p>}

      <div className="mt-5">
        {loading ? (
          <p className="py-8 text-sm text-zinc-500">Memuat komentar...</p>
        ) : topLevel.length === 0 ? (
          <div className="surface rounded-2xl px-5 py-8 text-center"><p className="font-black">Belum ada komentar</p><p className="mt-1 text-sm text-zinc-400">Jadilah yang pertama membahas episode ini.</p></div>
        ) : (
          topLevel.slice().reverse().map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              profile={profiles.get(comment.user_id)}
              replies={repliesByParent.get(comment.id) ?? []}
              profiles={profiles}
              currentUserId={user?.id ?? null}
              liked={liked}
              onReply={(parentId, body) => createComment(body, parentId)}
              onLike={toggleLike}
              onDelete={deleteComment}
              onReport={reportComment}
            />
          ))
        )}
      </div>
    </section>
  );
}
