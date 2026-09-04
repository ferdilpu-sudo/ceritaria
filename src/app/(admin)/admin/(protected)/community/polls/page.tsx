import Link from "next/link";
import { createPollAction, deletePollAction, setPollActiveAction } from "@/features/admin/actions/poll-actions";
import { requireAdmin } from "@/lib/security/require-admin";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ status?: string }> };

const statusCopy: Record<string, string> = {
  created: "Prediksi berhasil dibuat.",
  opened: "Voting dibuka kembali.",
  closed: "Voting ditutup. Hasil tetap terlihat.",
  deleted: "Prediksi dihapus.",
  exists: "Episode itu sudah memiliki prediksi.",
  invalid: "Periksa pertanyaan dan pilihan. Gunakan 2–6 pilihan.",
  error: "Perubahan belum berhasil disimpan.",
};

export default async function PollAdminPage({ searchParams }: PageProps) {
  const { supabase } = await requireAdmin();
  const { status } = await searchParams;
  const [{ data: episodes }, { data: polls }] = await Promise.all([
    supabase.from("episodes").select("id,title,episode_number,series_id").is("deleted_at", null).order("episode_number", { ascending: false }).limit(300),
    supabase.from("episode_polls").select("id,episode_id,question,is_active,created_at").order("created_at", { ascending: false }).limit(100),
  ]);

  const pollRows = polls ?? [];
  const { data: options } = pollRows.length
    ? await supabase.from("episode_poll_options").select("poll_id,label,sort_order,vote_count").in("poll_id", pollRows.map((item) => item.id)).order("sort_order")
    : { data: [] };
  const episodeMap = new Map((episodes ?? []).map((item) => [item.id, item]));
  const optionsMap = new Map<string, typeof options>();
  (options ?? []).forEach((item) => optionsMap.set(item.poll_id, [...(optionsMap.get(item.poll_id) ?? []), item]));

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-red-600">KOMUNITAS</p>
          <h1 className="mt-1 text-3xl font-black text-[var(--text)]">Prediksi Episode</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">Buat satu polling per episode. Setelah penonton memilih, pilihannya terkunci.</p>
        </div>
        <Link href="/admin/community" className="min-h-11 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-bold text-[var(--text)]">← Moderasi</Link>
      </header>

      {status && statusCopy[status] && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-bold ${["error","invalid","exists"].includes(status) ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {statusCopy[status]}
        </div>
      )}

      <section className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-[var(--text)]">Buat Prediksi</h2>
        <form action={createPollAction} className="mt-5 grid gap-4">
          <label className="grid gap-1.5 text-sm font-bold text-[var(--text)]">
            Episode
            <select name="episodeId" required className="min-h-12 rounded-xl border border-[var(--border)] bg-white px-3 font-medium">
              <option value="">Pilih episode</option>
              {(episodes ?? []).map((episode) => <option key={episode.id} value={episode.id}>EP {episode.episode_number} · {episode.title}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-[var(--text)]">
            Pertanyaan
            <input name="question" required minLength={4} maxLength={160} placeholder="Menurut kamu apa yang akan terjadi selanjutnya?" className="min-h-12 rounded-xl border border-[var(--border)] px-3 font-medium" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-[var(--text)]">
            Pilihan, satu per baris
            <textarea name="options" required rows={5} placeholder={"Ana pergi\nMax mengejar Ana\nPapa Max menghalangi"} className="rounded-xl border border-[var(--border)] px-3 py-3 font-medium" />
            <span className="text-xs font-medium text-[var(--muted)]">Minimal 2, maksimal 6 pilihan.</span>
          </label>
          <button className="min-h-12 w-fit rounded-xl bg-red-600 px-5 font-black text-white hover:bg-red-700">Buat Prediksi</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-[var(--text)]">Prediksi Aktif & Lama</h2>
        {pollRows.length === 0 ? <div className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center text-[var(--muted)]">Belum ada prediksi.</div> : pollRows.map((poll) => {
          const episode = episodeMap.get(poll.episode_id);
          const pollOptions = optionsMap.get(poll.id) ?? [];
          const total = pollOptions.reduce((sum, item) => sum + item.vote_count, 0);
          return (
            <article key={poll.id} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-red-600">EP {episode?.episode_number ?? "?"} · {episode?.title ?? "Episode"}</p>
                  <h3 className="mt-1 font-black text-[var(--text)]">{poll.question}</h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">{total} suara · {poll.is_active ? "Voting terbuka" : "Voting ditutup"}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-black ${poll.is_active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>{poll.is_active ? "AKTIF" : "SELESAI"}</span>
              </div>
              <div className="mt-4 space-y-2">
                {pollOptions.map((option) => {
                  const percent = total > 0 ? Math.round((option.vote_count / total) * 100) : 0;
                  return <div key={`${poll.id}-${option.sort_order}`} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface)] px-3 py-2 text-sm"><span className="font-bold">{option.label}</span><span className="text-[var(--muted)]">{option.vote_count} · {percent}%</span></div>;
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={setPollActiveAction}><input type="hidden" name="id" value={poll.id} /><input type="hidden" name="active" value={poll.is_active ? "false" : "true"} /><button className="min-h-10 rounded-xl border border-[var(--border)] px-3 text-sm font-bold">{poll.is_active ? "Tutup voting" : "Buka voting"}</button></form>
                <form action={deletePollAction}><input type="hidden" name="id" value={poll.id} /><button className="min-h-10 rounded-xl bg-red-50 px-3 text-sm font-bold text-red-700">Hapus</button></form>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
