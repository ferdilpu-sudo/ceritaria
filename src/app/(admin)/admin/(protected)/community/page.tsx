import Link from "next/link";
import { deleteCommentAdminAction, setCommentHiddenAction, setCommunityUserBlockedAction } from "@/features/admin/actions/community-actions";
import { requireAdmin } from "@/lib/security/require-admin";

export const dynamic = "force-dynamic";

export default async function CommunityAdminPage() {
  const { supabase } = await requireAdmin();
  const { data: comments } = await supabase
    .from("episode_comments")
    .select("id,episode_id,user_id,parent_id,body,like_count,is_hidden,deleted_at,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = comments ?? [];
  const userIds = [...new Set(rows.map((row) => row.user_id))];
  const episodeIds = [...new Set(rows.map((row) => row.episode_id))];
  const [{ data: profiles }, { data: episodes }, { data: reports }] = await Promise.all([
    userIds.length ? supabase.from("community_profiles").select("user_id,display_name,is_blocked").in("user_id", userIds) : Promise.resolve({ data: [] }),
    episodeIds.length ? supabase.from("episodes").select("id,title,episode_number").in("id", episodeIds) : Promise.resolve({ data: [] }),
    rows.length ? supabase.from("comment_reports").select("comment_id").in("comment_id", rows.map((row) => row.id)) : Promise.resolve({ data: [] }),
  ]);

  const profileMap = new Map((profiles ?? []).map((item) => [item.user_id, item]));
  const episodeMap = new Map((episodes ?? []).map((item) => [item.id, item]));
  const reportCount = new Map<string, number>();
  (reports ?? []).forEach((item) => reportCount.set(item.comment_id, (reportCount.get(item.comment_id) ?? 0) + 1));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-red-600">KOMUNITAS</p>
          <h1 className="mt-1 text-3xl font-black text-[var(--text)]">Moderasi Komentar</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">100 komentar terbaru. Sembunyikan konten bermasalah atau blokir akun yang berulang kali melanggar.</p>
        </div>
        <Link href="/admin/community/polls" className="min-h-11 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-700">Kelola Prediksi →</Link>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center text-[var(--muted)]">Belum ada komentar.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((comment) => {
            const profile = profileMap.get(comment.user_id);
            const episode = episodeMap.get(comment.episode_id);
            const deleted = Boolean(comment.deleted_at);
            return (
              <article key={comment.id} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-[var(--text)]">{profile?.display_name ?? "Penonton"}</span>
                      {profile?.is_blocked && <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-black text-red-700">DIBLOKIR</span>}
                      {comment.is_hidden && <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700">DISEMBUNYIKAN</span>}
                      {deleted && <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-black text-zinc-600">DIHAPUS</span>}
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">Episode {episode?.episode_number ?? "?"} · {episode?.title ?? "Episode"} · {new Date(comment.created_at).toLocaleString("id-ID")}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-black ${(reportCount.get(comment.id) ?? 0) > 0 ? "bg-red-50 text-red-700" : "bg-[var(--surface)] text-[var(--muted)]"}`}>
                    {reportCount.get(comment.id) ?? 0} laporan
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--text)]">{comment.body}</p>
                <p className="mt-2 text-xs font-bold text-[var(--muted)]">♥ {comment.like_count}{comment.parent_id ? " · Balasan" : ""}</p>

                {!deleted && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <form action={setCommentHiddenAction}>
                      <input type="hidden" name="id" value={comment.id} />
                      <input type="hidden" name="hidden" value={comment.is_hidden ? "false" : "true"} />
                      <button className="min-h-10 rounded-xl border border-[var(--border)] px-3 text-sm font-bold text-[var(--text)] hover:bg-[var(--surface)]">
                        {comment.is_hidden ? "Tampilkan" : "Sembunyikan"}
                      </button>
                    </form>
                    <form action={deleteCommentAdminAction}>
                      <input type="hidden" name="id" value={comment.id} />
                      <button className="min-h-10 rounded-xl bg-red-50 px-3 text-sm font-bold text-red-700 hover:bg-red-100">Hapus</button>
                    </form>
                    <form action={setCommunityUserBlockedAction}>
                      <input type="hidden" name="userId" value={comment.user_id} />
                      <input type="hidden" name="blocked" value={profile?.is_blocked ? "false" : "true"} />
                      <button className="min-h-10 rounded-xl border border-[var(--border)] px-3 text-sm font-bold text-[var(--muted)] hover:bg-[var(--surface)]">
                        {profile?.is_blocked ? "Buka blokir" : "Blokir user"}
                      </button>
                    </form>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
