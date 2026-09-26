import type { Metadata } from "next";
import Link from "next/link";
import { HomeEpisodeCard } from "@/features/home/components/HomeEpisodeCard";
import { HomeSectionHeader } from "@/features/home/components/HomeSectionHeader";
import { HomeSeriesCard } from "@/features/home/components/HomeSeriesCard";
import { HeroSeriesCarousel } from "@/features/series/components/HeroSeriesCarousel";
import { ContinueWatchingSection } from "@/features/watch-history/components/ContinueWatchingSection";
import { getLatestEpisodes } from "@/features/episode/services/public-episodes";
import { getPublishedSeries } from "@/features/series/services/public-series";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Ceritaria",
  description: "Mini series drama original dengan sinopsis, ringkasan episode, momen penting, dan panduan cerita agar mudah diikuti dari awal sampai akhir.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [series, episodes] = await Promise.all([
    getPublishedSeries(24),
    getLatestEpisodes(12),
  ]);
  const heroSeries = [
    ...series.filter((item) => item.is_featured),
    ...series.filter((item) => !item.is_featured),
  ].slice(0, 5);

  return (
    <div className="shell pb-8 pt-0 sm:pb-20 sm:pt-10 lg:pt-12">
      {heroSeries.length > 0 ? (
        <div className="-mx-4 sm:mx-0"><HeroSeriesCarousel series={heroSeries} /></div>
      ) : (
        <div className="surface rounded-3xl p-10 text-center"><h1 className="text-3xl font-black">CERITARIA</h1><p className="mt-3 muted">Belum ada series yang dipublikasikan.</p></div>
      )}

      <ContinueWatchingSection />

      {episodes.length > 0 && (
        <section id="episode-terbaru" className="mt-8 scroll-mt-20 sm:mt-14 sm:scroll-mt-24" aria-labelledby="latest-episodes-title">
          <HomeSectionHeader eyebrow="BARU DI CERITARIA" title="Episode Terbaru" actionHref="#semua-series" actionLabel="Jelajahi series" />
          <div className="mobile-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:gap-5 sm:px-0 sm:pb-4">
            {episodes.map((episode) => <HomeEpisodeCard key={episode.id} episode={episode} />)}
          </div>
        </section>
      )}

      <section className="mt-10 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:mt-14 sm:p-8" aria-labelledby="about-ceritaria-title">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black tracking-[0.18em] text-red-400 sm:text-xs">LEBIH DARI SEKADAR PLAYER</p>
            <h2 id="about-ceritaria-title" className="mt-2 text-2xl font-black sm:text-3xl">Ikuti cerita tanpa kehilangan konteks</h2>
            <div className="prose-ceritaria mt-4 max-w-3xl">
              <p>
                Ceritaria menyusun mini drama dalam urutan episode yang jelas. Setiap series memiliki sinopsis yang menjelaskan premis dan konflik utamanya,
                sementara halaman episode dapat memuat ringkasan cerita serta momen penting yang membantu penonton mengingat perkembangan alur.
              </p>
              <p>
                Kamu bisa mulai dari episode pertama, melanjutkan tontonan terakhir, membaca ringkasan sebelum menonton, atau membuka panduan cerita untuk
                memahami series yang belum pernah kamu ikuti. Video adalah bagian utama pengalaman, tetapi cerita dan konteksnya tetap bisa dibaca langsung di Ceritaria.
              </p>
            </div>
          </div>
          <Link href="/cerita" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-white transition hover:bg-white/[0.08]">
            Baca Panduan Cerita →
          </Link>
        </div>
      </section>

      <section id="semua-series" className="scroll-mt-20 pt-8 sm:scroll-mt-24 sm:pt-12" aria-labelledby="all-series-title">
        <HomeSectionHeader eyebrow="JELAJAHI CERITA" title="Semua Series" actionHref="/cerita" actionLabel="Baca panduan" />
        {series.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
            {series.map((item) => <HomeSeriesCard key={item.id} series={item} />)}
          </div>
        ) : <p className="muted">Belum ada series yang dipublikasikan.</p>}
      </section>
    </div>
  );
}
