import type { Metadata } from "next";
import { AdSlot } from "@/components/ads/AdSlot";
import { HomeEpisodeCard } from "@/features/home/components/HomeEpisodeCard";
import { HomeSectionHeader } from "@/features/home/components/HomeSectionHeader";
import { HomeSeriesCard } from "@/features/home/components/HomeSeriesCard";
import { HeroSeries } from "@/features/series/components/HeroSeries";
import { ContinueWatchingSection } from "@/features/watch-history/components/ContinueWatchingSection";
import { getLatestEpisodes } from "@/features/episode/services/public-episodes";
import { getFeaturedSeries, getPublishedSeries } from "@/features/series/services/public-series";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ceritaria", alternates: { canonical: "/" } };

export default async function HomePage() {
  const [featured, series, episodes] = await Promise.all([
    getFeaturedSeries(),
    getPublishedSeries(24),
    getLatestEpisodes(12),
  ]);
  const hero = featured ?? series[0] ?? null;

  return (
    <div className="shell pb-8 pt-0 sm:pb-20 sm:pt-10 lg:pt-12">
      {hero ? (
        <div className="-mx-4 sm:mx-0"><HeroSeries series={hero} /></div>
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

      <AdSlot />

      <section id="semua-series" className="scroll-mt-20 pt-1 sm:scroll-mt-24 sm:pt-2" aria-labelledby="all-series-title">
        <HomeSectionHeader eyebrow="JELAJAHI CERITA" title="Semua Series" />
        {series.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
            {series.map((item) => <HomeSeriesCard key={item.id} series={item} />)}
          </div>
        ) : <p className="muted">Belum ada series yang dipublikasikan.</p>}
      </section>
    </div>
  );
}
