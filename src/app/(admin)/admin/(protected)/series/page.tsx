import Link from "next/link";
import { DeleteContentButton } from "@/features/admin/components/DeleteContentButton";
import { getAdminSeries } from "@/features/admin/services/admin-content";

export default async function AdminSeriesPage() {
  const series = await getAdminSeries();
  const published = series.filter((item) => item.is_published).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-red-600">KATALOG</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--text)]">Series</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{series.length} total · {published} published · {series.length - published} draft</p>
        </div>
        <Link href="/admin/series/new" className="min-h-11 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--primary-hover)]">
          + Series Baru
        </Link>
      </div>

      <div className="mt-7 space-y-3">
        {series.length ? (
          series.map((item) => (
            <article key={item.id} className="surface flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-black text-[var(--muted)]">
                S
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-bold text-[var(--text)]">{item.title}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${item.is_published ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-zinc-200 bg-zinc-100 text-zinc-600"}`}>
                    {item.is_published ? "PUBLISHED" : "DRAFT"}
                  </span>
                  {item.is_featured && <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-700">FEATURED</span>}
                </div>
                <p className="mt-1 truncate text-sm text-[var(--muted)]">/{item.slug}</p>
                <p className="mt-1 truncate text-xs text-[var(--muted)]">{item.genres.length ? item.genres.join(" · ") : "Genre belum diisi"}</p>
              </div>
              <div className="flex gap-2 sm:justify-end">
                <Link href={`/admin/series/${item.id}/edit`} className="min-h-11 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-bold text-[var(--text)] hover:bg-[var(--surface-2)]">
                  Edit
                </Link>
                <DeleteContentButton id={item.id} kind="series" />
              </div>
            </article>
          ))
        ) : (
          <div className="surface rounded-2xl p-8 text-center">
            <p className="font-bold text-[var(--text)]">Belum ada series</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Buat series pertama untuk mulai mengisi katalog CERITARIA.</p>
          </div>
        )}
      </div>
    </div>
  );
}
