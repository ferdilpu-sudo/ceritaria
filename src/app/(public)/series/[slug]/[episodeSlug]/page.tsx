import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { EpisodeCard } from "@/features/episode/components/EpisodeCard";
import { EpisodeNavigation } from "@/features/episode/components/EpisodeNavigation";
import { EpisodeVideoEmbed } from "@/features/episode/components/EpisodeVideoEmbed";
import { EpisodeViewTracker } from "@/features/episode/components/EpisodeViewTracker";
import { getPublishedEpisode, getPublishedEpisodesForSeries } from "@/features/episode/services/public-episodes";
import { getPublishedSeriesBySlug } from "@/features/series/services/public-series";
import { getPublicEnv } from "@/lib/env";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string; episodeSlug: string }>;
}

async function getEpisodeContext(slug: string, episodeSlug: string) {
  const series = await getPublishedSeriesBySlug(slug);
  if (!series) return null;

  const [episode, allEpisodes] = await Promise.all([
    getPublishedEpisode(series.id, episodeSlug),
    getPublishedEpisodesForSeries(series.id),
  ]);
  if (!episode) return null;

  const index = allEpisodes.findIndex((item) => item.id === episode.id);
  return {
    series,
    episode,
    allEpisodes,
    previous: index > 0 ? allEpisodes[index - 1] : undefined,
    next: index >= 0 ? allEpisodes[index + 1] : undefined,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, episodeSlug } = await params;
  const context = await getEpisodeContext(slug, episodeSlug);
  if (!context) return {};

  const { series, episode } = context;
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  return {
    title: episode.seo_title ?? `${episode.title} - ${series.title}`,
    description: episode.seo_description ?? episode.short_synopsis ?? undefined,
    alternates: { canonical: `${NEXT_PUBLIC_SITE_URL}/series/${series.slug}/${episode.slug}` },
    openGraph: {
      title: episode.title,
      description: episode.short_synopsis ?? undefined,
      images: episode.thumbnail_url ? [episode.thumbnail_url] : undefined,
    },
  };
}

export default async function EpisodePage({ params }: PageProps) {
  const { slug, episodeSlug } = await params;
  const context = await getEpisodeContext(slug, episodeSlug);
  if (!context) notFound();

  const { series, episode, allEpisodes, previous, next } = context;
  const related = allEpisodes
    .filter((item) => item.id !== episode.id)
    .slice(Math.max(0, episode.episode_number - 3), episode.episode_number + 2)
    .slice(0, 5);
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVEpisode",
    name: episode.title,
    episodeNumber: episode.episode_number,
    partOfSeries: {
      "@type": "TVSeries",
      name: series.title,
      url: `${NEXT_PUBLIC_SITE_URL}/series/${series.slug}`,
    },
    url: `${NEXT_PUBLIC_SITE_URL}/series/${series.slug}/${episode.slug}`,
    description: episode.short_synopsis ?? undefined,
  };

  return (
    <div className="shell pb-0 pt-3 sm:pt-9">
      <EpisodeViewTracker episodeId={episode.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Kembali ke series" className="mb-3 sm:hidden">
        <Link href={`/series/${series.slug}`} className="inline-flex min-h-11 items-center rounded-2xl pr-4 text-sm font-bold text-zinc-300 active:scale-[0.98]">
          ← {series.title}
        </Link>
      </nav>

      <nav aria-label="Breadcrumb" className="mb-6 hidden flex-wrap items-center gap-2 text-sm text-zinc-400 sm:flex">
        <Link href="/" className="transition hover:text-white">Beranda</Link>
        <span aria-hidden="true" className="text-zinc-700">/</span>
        <Link href={`/series/${series.slug}`} className="transition hover:text-white">{series.title}</Link>
        <span aria-hidden="true" className="text-zinc-700">/</span>
        <span className="text-zinc-300">Episode {episode.episode_number}</span>
      </nav>

      <div className="grid gap-5 sm:gap-8 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <EpisodeVideoEmbed
            provider={episode.video_provider}
            videoUrl={episode.video_url}
            thumbnailUrl={episode.thumbnail_url}
            title={episode.title}
            episodeId={episode.id}
          />
        </div>

        <main className="min-w-0 max-w-3xl">
          <p className="text-[10px] font-black tracking-[0.2em] text-red-400 sm:text-xs sm:tracking-[0.18em]">EPISODE {episode.episode_number}</p>
          <h1 className="mt-2 text-[1.8rem] font-black leading-tight sm:text-4xl lg:text-[2.6rem]">{episode.title}</h1>
          {episode.short_synopsis && <p className="mt-3 text-sm leading-6 text-zinc-300 sm:mt-5 sm:max-w-2xl sm:text-lg sm:leading-7">{episode.short_synopsis}</p>}
          <div className="mt-5 sm:mt-6"><EpisodeNavigation seriesSlug={series.slug} previous={previous} next={next} /></div>

          {episode.recap && (
            <section className="mt-8 border-t border-[var(--border)] pt-7 sm:mt-10 sm:pt-8">
              <h2 className="text-xl font-black sm:text-2xl">Recap Episode</h2>
              <div className="prose-ceritaria mt-4 max-w-2xl">
                {episode.recap.split(/\n\n+/).map((paragraph, index) => <p key={`${episode.id}-${index}`}>{paragraph}</p>)}
              </div>
            </section>
          )}

          {episode.highlights.length > 0 && (
            <section className="mt-8 sm:mt-9">
              <h2 className="text-xl font-black sm:text-2xl">Momen Penting</h2>
              <ul className="mt-4 space-y-2.5 sm:space-y-3">
                {episode.highlights.map((item, index) => (
                  <li key={item} className="surface flex items-start gap-3 rounded-2xl px-4 py-3.5 leading-6 sm:rounded-xl">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-950 text-xs font-black text-red-300">{index + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>

      <div className="mx-auto mt-8 max-w-3xl sm:mt-10"><AdSlot /></div>

      {related.length > 0 && (
        <section className="mt-10 border-t border-[var(--border)] pt-7 sm:mt-14 sm:pt-10">
          <div className="mb-4 flex max-w-4xl items-end justify-between gap-4 sm:mb-5">
            <div>
              <p className="text-[10px] font-black tracking-[0.18em] text-red-400 sm:text-xs sm:tracking-[0.16em]">LANJUT NONTON</p>
              <h2 className="mt-1 text-[22px] font-black sm:text-2xl">Episode Lainnya</h2>
            </div>
            <Link href={`/series/${series.slug}`} className="min-h-11 rounded-lg px-2 py-3 text-sm font-bold text-zinc-400 transition hover:text-white">Semua →</Link>
          </div>
          <div className="mobile-scrollbar -mx-4 flex max-w-4xl snap-x snap-mandatory flex-nowrap gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:flex-wrap sm:gap-x-5 sm:gap-y-8 sm:overflow-visible sm:px-0">
            {related.map((item) => <EpisodeCard key={item.id} episode={item} seriesSlug={series.slug} variant="related" />)}
          </div>
        </section>
      )}
    </div>
  );
}
