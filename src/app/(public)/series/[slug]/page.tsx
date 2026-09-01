import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { MediaImage } from "@/components/ui/MediaImage";
import { EpisodeCard } from "@/features/episode/components/EpisodeCard";
import { getPublishedEpisodesForSeries } from "@/features/episode/services/public-episodes";
import { SeriesFallbackVisual } from "@/features/series/components/SeriesFallbackVisual";
import { getPublishedSeriesBySlug } from "@/features/series/services/public-series";
import { getPublicEnv } from "@/lib/env";

export const revalidate = 300;
interface PageProps { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = await getPublishedSeriesBySlug(slug);
  if (!series) return {};
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  return {
    title: series.seo_title ?? series.title,
    description: series.seo_description ?? series.short_synopsis ?? undefined,
    alternates: { canonical: `${NEXT_PUBLIC_SITE_URL}/series/${series.slug}` },
    openGraph: {
      title: series.title,
      description: series.short_synopsis ?? undefined,
      images: series.cover_url ? [series.cover_url] : undefined,
    },
  };
}

export default async function SeriesPage({ params }: PageProps) {
  const { slug } = await params;
  const series = await getPublishedSeriesBySlug(slug);
  if (!series) notFound();

  const episodes = await getPublishedEpisodesForSeries(series.id);
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  const first = episodes[0];
  const latest = episodes.at(-1);
  const heroImage = series.hero_url ?? series.cover_url;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: series.title,
    description: series.short_synopsis ?? series.synopsis ?? undefined,
    url: `${NEXT_PUBLIC_SITE_URL}/series/${series.slug}`,
    genre: series.genres,
  };

  return (
    <div className="shell pb-8 pt-0 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="-mx-4 sm:hidden">
        <div className="relative min-h-[40dvh] overflow-hidden bg-[#111116]">
          {heroImage ? (
            <MediaImage src={heroImage} alt={`Visual ${series.title}`} priority className="object-cover object-center" />
          ) : (
            <SeriesFallbackVisual seed={`${series.slug}|${series.title}`} genres={series.genres} className="absolute inset-0" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-black/30 to-black/5" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
            <p className="text-[10px] font-black tracking-[0.2em] text-red-400">SERIES</p>
            <h1 className="mt-1.5 text-[2.05rem] font-black leading-[1.03] tracking-[-0.02em]">{series.title}</h1>
            {series.genres.length > 0 && <p className="mt-2 text-[11px] font-semibold text-zinc-300">{series.genres.join(" • ")}</p>}
          </div>
        </div>

        <div className="px-4 pt-3">
          {series.synopsis && <p className="line-clamp-4 text-[13px] leading-[1.55rem] text-zinc-300">{series.synopsis}</p>}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {first && <Link href={`/series/${series.slug}/${first.slug}`} className="flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 text-sm font-black text-white shadow-lg shadow-red-950/20 active:scale-[0.98]"><span aria-hidden="true">▶</span> Mulai</Link>}
            {latest && latest.id !== first?.id && <Link href={`/series/${series.slug}/${latest.slug}`} className="surface flex min-h-13 items-center justify-center rounded-2xl px-4 text-sm font-black text-zinc-100 active:scale-[0.98]">Terbaru</Link>}
          </div>
        </div>
      </section>

      <div className="hidden gap-7 sm:grid md:grid-cols-[280px_1fr] lg:gap-10">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-3xl surface">
          {series.cover_url ? <MediaImage src={series.cover_url} alt={`Poster ${series.title}`} priority /> : <SeriesFallbackVisual seed={`${series.slug}|cover`} genres={series.genres} className="absolute inset-0" />}
        </div>
        <section className="self-end">
          <p className="text-xs font-black tracking-[0.16em] text-red-400">SERIES</p>
          <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">{series.title}</h1>
          {series.genres.length > 0 && <p className="mt-3 text-sm muted">{series.genres.join(" • ")}</p>}
          {series.synopsis && <div className="prose-ceritaria mt-6"><p>{series.synopsis}</p></div>}
          <div className="mt-6 flex flex-wrap gap-3">
            {first && <Link href={`/series/${series.slug}/${first.slug}`} className="inline-flex min-h-12 items-center rounded-xl bg-[var(--primary)] px-5 font-bold">Mulai Episode 1</Link>}
            {latest && latest.id !== first?.id && <Link href={`/series/${series.slug}/${latest.slug}`} className="inline-flex min-h-12 items-center rounded-xl surface px-5 font-bold">Episode Terbaru</Link>}
          </div>
        </section>
      </div>

      <AdSlot />

      <section id="daftar-episode" className="mt-7 scroll-mt-20 sm:mt-12 sm:scroll-mt-24">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-[22px] font-black sm:text-2xl">Daftar Episode</h2>
          <span className="text-xs text-zinc-500">{episodes.length} episode</span>
        </div>
        {episodes.length ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 md:grid-cols-4 lg:grid-cols-5">
            {episodes.map((episode) => <EpisodeCard key={episode.id} episode={episode} seriesSlug={series.slug} />)}
          </div>
        ) : <p className="muted">Belum ada episode yang dipublikasikan.</p>}
      </section>
    </div>
  );
}
