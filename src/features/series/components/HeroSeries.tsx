import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import { SeriesFallbackVisual } from "@/features/series/components/SeriesFallbackVisual";
import type { PublicSeries } from "@/features/series/types/series";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M8.2 5.8v12.4a1 1 0 0 0 1.55.83l8.6-6.2a1 1 0 0 0 0-1.66l-8.6-6.2A1 1 0 0 0 8.2 5.8Z" />
    </svg>
  );
}

export function HeroSeries({ series }: { series: PublicSeries }) {
  const image = series.hero_url ?? series.cover_url;

  return (
    <section className="surface relative min-h-[48dvh] overflow-hidden rounded-[24px] sm:min-h-[410px] sm:rounded-[28px] lg:min-h-[430px]">
      {image ? (
        <div className="absolute inset-0">
          <MediaImage src={image} alt={`Visual utama ${series.title}`} priority className="object-cover object-center" />
        </div>
      ) : (
        <SeriesFallbackVisual seed={`${series.slug}|${series.title}`} genres={series.genres} className="absolute inset-0" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />

      <div className="relative flex min-h-[48dvh] max-w-4xl flex-col justify-end p-5 pb-6 sm:min-h-[410px] sm:p-9 lg:min-h-[430px] lg:p-10">
        <p className="mb-2 text-[10px] font-black tracking-[0.2em] text-red-400 sm:mb-3 sm:text-[11px]">SERIES UNGGULAN</p>
        <h1 className="max-w-4xl text-[2.05rem] font-black leading-[1.02] tracking-[-0.025em] sm:text-5xl lg:text-6xl">{series.title}</h1>

        {series.genres.length > 0 && <p className="mt-2 text-[11px] font-semibold text-zinc-300 sm:hidden">{series.genres.join(" • ")}</p>}
        {series.short_synopsis && <p className="mt-3 line-clamp-3 max-w-2xl text-[13px] leading-[1.55rem] text-zinc-200 sm:mt-4 sm:line-clamp-none sm:text-base sm:leading-7">{series.short_synopsis}</p>}

        <div className="mt-4 sm:mt-6">
          <Link href={`/series/${series.slug}`} className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 font-black text-white shadow-lg shadow-red-950/20 transition active:scale-[0.98] sm:min-h-12 sm:w-auto sm:rounded-xl sm:hover:bg-[var(--primary-hover)]">
            <PlayIcon /> Lihat Series
          </Link>
        </div>
      </div>
    </section>
  );
}
