import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import { SeriesFallbackVisual } from "@/features/series/components/SeriesFallbackVisual";
import { getPublishedSeries } from "@/features/series/services/public-series";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Series",
  description: "Jelajahi semua mini series Ceritaria, baca sinopsis, genre, dan pilih cerita yang ingin kamu ikuti.",
  alternates: { canonical: "/cerita" },
};

export default async function StoryGuidePage() {
  const series = await getPublishedSeries(100);

  return (
    <div className="shell py-8 sm:py-12">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-black tracking-[0.18em] text-red-400">SERIES CERITARIA</p>
        <h1 className="mt-2 text-3xl font-black sm:text-5xl">Temukan cerita yang ingin kamu ikuti</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-300 sm:text-base">
          Jelajahi semua series Ceritaria dari satu tempat. Baca premis, konflik, dan genre untuk memilih cerita baru,
          lalu buka series untuk mulai dari episode pertama atau melanjutkan alur yang sudah kamu ikuti.
        </p>
      </header>

      {series.length > 0 ? (
        <section className="mt-10 space-y-6 sm:mt-14" aria-label="Semua series Ceritaria">
          {series.map((item) => {
            const synopsis = item.synopsis ?? item.short_synopsis;
            return (
              <article key={item.id} className="surface overflow-hidden rounded-3xl border border-[var(--border)] sm:grid sm:grid-cols-[210px_1fr]">
                <Link href={`/series/${item.slug}`} className="relative block aspect-[16/9] bg-[#111116] sm:aspect-auto sm:min-h-[280px]" aria-label={`Buka ${item.title}`}>
                  {item.cover_url ? (
                    <MediaImage src={item.cover_url} alt={`Poster ${item.title}`} sizes="(max-width: 639px) 100vw, 210px" />
                  ) : (
                    <SeriesFallbackVisual seed={`${item.slug}|guide`} genres={item.genres} className="absolute inset-0" />
                  )}
                </Link>

                <div className="p-5 sm:p-7">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-black tracking-[0.12em] text-red-400">
                    <span>SERIES CERITARIA</span>
                    {item.genres.length > 0 && <span className="text-zinc-600">•</span>}
                    {item.genres.length > 0 && <span className="text-zinc-400">{item.genres.join(" • ")}</span>}
                  </div>
                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">{item.title}</h2>
                  {synopsis ? (
                    <div className="prose-ceritaria mt-4 max-w-3xl">
                      {synopsis.split(/\n\n+/).map((paragraph, index) => <p key={`${item.id}-guide-${index}`}>{paragraph}</p>)}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-zinc-400">Sinopsis lengkap sedang disiapkan.</p>
                  )}
                  <Link href={`/series/${item.slug}`} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-black text-white">
                    Lihat series dan episode →
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="surface mx-auto mt-10 max-w-2xl rounded-3xl p-8 text-center text-zinc-400">Belum ada series yang dipublikasikan.</div>
      )}
    </div>
  );
}
