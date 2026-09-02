import Link from "next/link";
import { DeleteContentButton } from "@/features/admin/components/DeleteContentButton";
import { AdminSavedNotice } from "@/features/admin/components/AdminSavedNotice";
import { getAdminEpisodes, getAdminSeries } from "@/features/admin/services/admin-content";

function providerChip(provider: string) {
  return provider === "YOUTUBE"
    ? "border border-red-200 bg-red-50 text-red-700"
    : provider === "FACEBOOK"
      ? "border border-sky-200 bg-sky-50 text-sky-700"
      : "border border-zinc-200 bg-zinc-100 text-zinc-700";
}

export default async function AdminEpisodesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [{ saved }, episodes, series] = await Promise.all([searchParams, getAdminEpisodes(), getAdminSeries()]);
  const seriesMap = new Map(series.map((item) => [item.id, item.title]));
  const published = episodes.filter((item) => item.is_published).length;

  return (
    <div className="min-w-0">
      <AdminSavedNotice kind="Episode" state={saved} />
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black tracking-[0.18em] text-red-600">KONTEN</p>
          <h1 className="mt-2 break-words text-3xl font-black text-[var(--text)]">Episode</h1>
          <p className="mt-2 break-words text-sm text-[var(--muted)]">{episodes.length} total · {published} published · {episodes.length - published} draft</p>
        </div>
        <Link href="/admin/episodes/new" className="min-h-11 rounded-xl bg-[var(--primary)] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[var(--primary-hover)] sm:shrink-0">
          + Episode Baru
        </Link>
      </div>

      <div className="mt-7 min-w-0 space-y-3">
        {episodes.length ? (
          episodes.map((item) => {
            const provider = String(item.video_provider ?? "VIDEO").toUpperCase();
            return (
              <article key={item.id} className="surface min-w-0 rounded-2xl p-4 sm:flex sm:items-center sm:gap-4 sm:p-5">
                <div className="flex min-w-0 items-start gap-3 sm:flex-1 sm:items-center sm:gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[10px] font-black text-[var(--muted)] sm:h-14 sm:w-14 sm:text-xs">EP {item.episode_number}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h2 className="min-w-0 max-w-full truncate font-bold text-[var(--text)]">{item.title}</h2>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${item.is_published ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-zinc-200 bg-zinc-100 text-zinc-600"}`}>{item.is_published ? "PUBLISHED" : "DRAFT"}</span>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${providerChip(provider)}`}>{provider}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-[var(--muted)]">{seriesMap.get(item.series_id) ?? "Series tidak ditemukan"}</p>
                    <p className="mt-1 truncate text-xs text-[var(--muted)]">/{item.slug}</p>
                  </div>
                </div>
                <div className="mt-4 grid min-w-0 grid-cols-2 gap-2 sm:mt-0 sm:flex sm:shrink-0">
                  <Link href={`/admin/episodes/${item.id}/edit`} className="min-h-11 min-w-0 rounded-xl border border-[var(--border)] bg-white px-3 py-3 text-center text-sm font-bold text-[var(--text)] hover:bg-[var(--surface-2)] sm:px-4">Edit</Link>
                  <DeleteContentButton id={item.id} kind="episode" />
                </div>
              </article>
            );
          })
        ) : (
          <div className="surface min-w-0 rounded-2xl p-8 text-center">
            <p className="font-bold text-[var(--text)]">Belum ada episode</p>
            <p className="mt-2 break-words text-sm text-[var(--muted)]">Buat episode pertama setelah series tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
