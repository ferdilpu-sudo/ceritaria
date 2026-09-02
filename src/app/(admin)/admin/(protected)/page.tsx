import Link from "next/link";
import { AdminMetricCard } from "@/features/admin/components/AdminMetricCard";
import { AdminRecentList, type AdminRecentItem } from "@/features/admin/components/AdminRecentList";
import { getAdminEpisodes, getAdminSeries } from "@/features/admin/services/admin-content";
import { AnalyticsDashboardSummary } from "@/features/analytics/components/AnalyticsDashboardSummary";
import { getAnalyticsReport } from "@/features/analytics/services/admin-analytics";

export default async function AdminDashboard() {
  const [series, episodes, analytics] = await Promise.all([getAdminSeries(), getAdminEpisodes(), getAnalyticsReport(7)]);
  const publishedSeries = series.filter((item) => item.is_published).length;
  const publishedEpisodes = episodes.filter((item) => item.is_published).length;
  const draftSeries = series.length - publishedSeries;
  const draftEpisodes = episodes.length - publishedEpisodes;
  const seriesMap = new Map(series.map((item) => [item.id, item.title]));

  const recentSeries: AdminRecentItem[] = series.slice(0, 4).map((item) => ({
    id: item.id,
    title: item.title,
    meta: item.genres.length ? item.genres.join(" · ") : `/${item.slug}`,
    href: `/admin/series/${item.id}/edit`,
    published: item.is_published,
    badge: item.is_featured ? "FEATURED" : undefined,
  }));

  const recentEpisodes: AdminRecentItem[] = episodes.slice(0, 4).map((item) => ({
    id: item.id,
    title: `EP ${item.episode_number} · ${item.title}`,
    meta: seriesMap.get(item.series_id) ?? "Series tidak ditemukan",
    href: `/admin/episodes/${item.id}/edit`,
    published: item.is_published,
    badge: String(item.video_provider ?? "").toUpperCase(),
  }));

  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-5">
        <div>
          <p className="text-[11px] font-black tracking-[0.18em] text-red-600 sm:text-xs">DASHBOARD</p>
          <h1 className="mt-1.5 text-[28px] font-black leading-tight text-[var(--text)] sm:mt-2 sm:text-4xl">Konten CERITARIA</h1>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-[var(--muted)] sm:mt-2 sm:text-sm">
            Ringkasan publikasi dan pintasan untuk mengelola katalog series serta episode.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
          <Link href="/admin/series/new" className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-center text-sm font-bold text-[var(--text)] active:bg-[var(--surface-2)] sm:hover:bg-[var(--surface-2)]">
            + Series
          </Link>
          <Link href="/admin/episodes/new" className="min-h-11 rounded-xl bg-[var(--primary)] px-4 py-3 text-center text-sm font-bold text-white active:bg-[var(--primary-hover)] sm:hover:bg-[var(--primary-hover)]">
            + Episode
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Statistik konten">
        <AdminMetricCard label="Total Series" value={series.length} hint={`${draftSeries} draft`} />
        <AdminMetricCard label="Series Published" value={publishedSeries} hint={`${series.length ? Math.round((publishedSeries / series.length) * 100) : 0}% tayang`} accent />
        <AdminMetricCard label="Total Episode" value={episodes.length} hint={`${draftEpisodes} draft`} />
        <AdminMetricCard label="Episode Published" value={publishedEpisodes} hint={`${episodes.length ? Math.round((publishedEpisodes / episodes.length) * 100) : 0}% tayang`} accent />
      </section>

      <AnalyticsDashboardSummary report={analytics} />

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <AdminRecentList eyebrow="TERBARU" title="Series" items={recentSeries} manageHref="/admin/series" emptyText="Belum ada series. Buat series pertama untuk memulai katalog." />
        <AdminRecentList eyebrow="TERBARU" title="Episode" items={recentEpisodes} manageHref="/admin/episodes" emptyText="Belum ada episode. Episode terbaru akan muncul di sini." />
      </div>

      <section className="surface flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-sm font-black text-[var(--text)]">Cek tampilan publik</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)] sm:text-sm">Pastikan perubahan konten terlihat benar sebelum dibagikan ke penonton.</p>
        </div>
        <Link href="/" target="_blank" rel="noopener noreferrer" className="min-h-11 shrink-0 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-center text-sm font-bold text-[var(--text)] active:bg-[var(--surface-2)] sm:hover:bg-[var(--surface-2)]">
          Buka CERITARIA ↗
        </Link>
      </section>
    </div>
  );
}
