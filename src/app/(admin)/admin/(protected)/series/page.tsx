import Link from "next/link";
import { DeleteContentButton } from "@/features/admin/components/DeleteContentButton";
import { AdminSavedNotice } from "@/features/admin/components/AdminSavedNotice";
import { getAdminSeries } from "@/features/admin/services/admin-content";

export default async function AdminSeriesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [{ saved }, series] = await Promise.all([searchParams, getAdminSeries()]);
  const published = series.filter((item) => item.is_published).length;

  return (
    <div className="min-w-0">
      <AdminSavedNotice kind="Series" state={saved} />
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black tracking-[0.18em] text-red-600">KATALOG</p>
          <h1 className="mt-2 break-words text-3xl font-black text-[var(--text)]">Series</h1>
          <p className="mt-2 break-words text-sm text-[var(--muted)]">{series.length} total · {published} published · {series.length - published} draft</p>
        </div>
        <Link href="/admin/series/new" className="min-h-11 rounded-xl bg-[var(--primary)] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[var(--primary-hover)] sm:shrink-0">
          + Series Baru
        </Link>
      </div>

      <div className="mt-7 min-w-0 space-y-3">
        {series.length ? (
          series.map((item) => (
            <article key={item.id} className="surface min-w-0 rounded-2xl p-4 sm:flex sm:items-center sm:gap-4 sm:p-5">
              <div className="flex min-w-0 items-start gap-3 sm:flex-1 sm:items-center sm:gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-black text-[var(--muted)] sm:h-14 sm:w-14">S</div>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h2 className="min-w-0 max-w-full truncate font-bold text-[var(--text)]">{item.title}</h2>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${item.is_published ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-zinc-200 bg-zinc-100 text-zinc-600"}`}>{item.is_published ? "PUBLISHED" : "DRAFT"}</span>
                    {item.is_featured && <span className="shrink-0 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-700">FEATURED</span>}
                  </div>
                  <p className="mt-1 truncate text-sm text-[var(--muted)]">/{item.slug}</p>
                  <p className="mt-1 truncate text-xs text-[var(--muted)]">{item.genres.length ? item.genres.join(" · ") : "Genre belum diisi"}</p>
                </div>
              </div>
              <div className="mt-4 grid min-w-0 grid-cols-2 gap-2 sm:mt-0 sm:flex sm:shrink-0">
                <Link href={`/admin/series/${item.id}/edit`} className="min-h-11 min-w-0 rounded-xl border border-[var(--border)] bg-white px-3 py-3 text-center text-sm font-bold text-[var(--text)] hover:bg-[var(--surface-2)] sm:px-4">Edit</Link>
                <DeleteContentButton id={item.id} kind="series" />
              </div>
            </article>
          ))
        ) : (
          <div className="surface min-w-0 rounded-2xl p-8 text-center">
            <p className="font-bold text-[var(--text)]">Belum ada series</p>
            <p className="mt-2 break-words text-sm text-[var(--muted)]">Buat series pertama untuk mulai mengisi katalog CERITARIA.</p>
          </div>
        )}
      </div>
    </div>
  );
}
