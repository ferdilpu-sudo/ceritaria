import Link from "next/link";
import { AdminFormHeader } from "@/features/admin/components/AdminFormHeader";
import { EpisodeForm } from "@/features/admin/components/EpisodeForm";
import { getAdminSeries } from "@/features/admin/services/admin-content";

export default async function NewEpisodePage() {
  const series = await getAdminSeries();

  return (
    <div className="relative left-1/2 w-[min(calc(100vw-40px),1400px)] -translate-x-1/2">
      <AdminFormHeader
        eyebrow="EPISODE"
        title="Episode Baru"
        description="Tambahkan video, thumbnail, recap, momen penting, dan metadata episode."
        backHref="/admin/episodes"
        backLabel="Daftar Episode"
      />
      {series.length ? (
        <EpisodeForm series={series} />
      ) : (
        <div className="surface rounded-2xl p-8 text-center">
          <p className="font-bold text-[var(--text)]">Belum ada series</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Buat series terlebih dahulu sebelum menambahkan episode.</p>
          <Link href="/admin/series/new" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-bold text-white">
            + Buat Series
          </Link>
        </div>
      )}
    </div>
  );
}
