import { AdminPreviewImage } from "@/features/admin/components/AdminPreviewImage";
import { SeriesFallbackVisual } from "@/features/series/components/SeriesFallbackVisual";

interface SeriesPreviewSidebarProps {
  title: string;
  slug: string;
  genres: string;
  coverSrc: string | null;
  heroSrc: string | null;
  published: boolean;
  featured: boolean;
}

export function SeriesPreviewSidebar({ title, slug, genres, coverSrc, heroSrc, published, featured }: SeriesPreviewSidebarProps) {
  const genreItems = genres.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 4);
  const seed = `${slug || title || "ceritaria"}|${title}`;

  return (
    <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
      <section className="surface rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black tracking-[0.16em] text-red-600">PREVIEW</p>
            <h2 className="mt-1 font-black text-[var(--text)]">Series</h2>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${published ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-zinc-200 bg-zinc-100 text-zinc-600"}`}>{published ? "PUBLISHED" : "DRAFT"}</span>
        </div>

        <div className="mx-auto mt-4 max-w-[220px]">
          {coverSrc ? (
            <AdminPreviewImage src={coverSrc} alt={`Cover ${title || "series"}`} aspect="poster" fallback="COVER" />
          ) : (
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-[var(--border)]">
              <SeriesFallbackVisual seed={`${seed}|cover`} genres={genreItems} className="absolute inset-0" />
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate font-black text-[var(--text)]">{title || "Judul series"}</h3>
            {featured && <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[9px] font-black text-rose-700">FEATURED</span>}
          </div>
          <p className="mt-1 truncate text-xs text-[var(--muted)]">/{slug || "slug-series"}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {genreItems.length ? genreItems.map((genre) => <span key={genre} className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-[10px] font-bold text-[var(--muted)]">{genre}</span>) : <span className="text-xs text-[var(--muted)]">Genre belum diisi</span>}
          </div>
        </div>
      </section>

      <section className="surface rounded-2xl p-4 sm:p-5">
        <div className="mb-3">
          <p className="text-sm font-black text-[var(--text)]">Hero Homepage</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Jika hero kosong, preview ini adalah fallback visual otomatis yang tampil ke penonton.</p>
        </div>
        {heroSrc ? (
          <AdminPreviewImage src={heroSrc} alt={`Hero ${title || "series"}`} aspect="hero" fallback="HERO" />
        ) : (
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-[var(--border)]">
            <SeriesFallbackVisual seed={`${seed}|hero`} genres={genreItems} className="absolute inset-0" />
          </div>
        )}
      </section>
    </aside>
  );
}
