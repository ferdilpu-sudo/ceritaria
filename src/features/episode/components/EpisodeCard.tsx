import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import type { EpisodeWithSeries, PublicEpisode } from "@/features/episode/types/episode";

interface EpisodeCardProps {
  episode: PublicEpisode | EpisodeWithSeries;
  seriesSlug?: string;
  compact?: boolean;
  variant?: "default" | "related";
}

function EpisodeFallback({ episodeNumber }: { episodeNumber: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
      <div className="absolute -left-10 top-1/4 h-28 w-28 rounded-full bg-red-700/15 blur-3xl" />
      <div className="absolute -right-12 bottom-1/4 h-36 w-36 rounded-full bg-white/[0.04] blur-3xl" />
      <span className="absolute left-3 top-3 text-[10px] font-black tracking-[0.18em] text-white/35">CERITARIA</span>
      <span className="absolute bottom-3 right-3 text-4xl font-black tabular-nums text-white/[0.07]">{String(episodeNumber).padStart(2, "0")}</span>
    </div>
  );
}

export function EpisodeCard({ episode, seriesSlug, compact = false, variant = "default" }: EpisodeCardProps) {
  const slug = seriesSlug ?? ("seriesSlug" in episode ? episode.seriesSlug : "");
  const sizeClass = compact ? "w-36 shrink-0 sm:w-44" : variant === "related" ? "w-[44vw] min-w-[148px] max-w-[176px] shrink-0 sm:w-44 lg:w-[180px]" : "";

  return (
    <article className={sizeClass}>
      <Link href={`/series/${slug}/${episode.slug}`} className="group block rounded-[20px] focus-visible:outline-offset-4 active:scale-[0.985] sm:rounded-2xl" aria-label={`Tonton ${episode.title}`}>
        <div className="surface relative aspect-[9/16] overflow-hidden rounded-[20px] transition duration-300 group-hover:-translate-y-1 group-hover:border-zinc-500 sm:rounded-2xl">
          {episode.thumbnail_url ? <MediaImage src={episode.thumbnail_url} alt={`Thumbnail ${episode.title}`} className="transition duration-500 group-hover:scale-[1.035]" /> : <EpisodeFallback episodeNumber={episode.episode_number} />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/5" />
          <span className="absolute bottom-2 left-2 rounded-lg border border-white/10 bg-black/75 px-2 py-1 text-[11px] font-black backdrop-blur-sm">EP {episode.episode_number}</span>
        </div>
        <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-5 transition group-hover:text-red-400 sm:mt-3">{episode.title}</h3>
        {"seriesTitle" in episode && <p className="mt-1 line-clamp-1 text-xs muted">{episode.seriesTitle}</p>}
      </Link>
    </article>
  );
}
