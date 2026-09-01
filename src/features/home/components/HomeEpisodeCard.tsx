import Image from "next/image";
import Link from "next/link";
import type { EpisodeWithSeries } from "@/features/episode/types/episode";

export function HomeEpisodeCard({ episode }: { episode: EpisodeWithSeries }) {
  return (
    <article className="w-[44vw] min-w-[152px] max-w-[184px] shrink-0 snap-start sm:w-44 lg:w-[176px]">
      <Link href={`/series/${episode.seriesSlug}/${episode.slug}`} className="group block rounded-[20px] focus-visible:outline-offset-4 active:scale-[0.985] sm:rounded-2xl">
        <div className="surface relative aspect-[9/16] overflow-hidden rounded-[20px] bg-zinc-950 sm:rounded-2xl">
          {episode.thumbnail_url ? (
            <Image src={episode.thumbnail_url} alt={`Thumbnail ${episode.title}`} fill sizes="(max-width: 640px) 44vw, 176px" className="object-cover transition duration-300 group-hover:scale-[1.035]" />
          ) : (
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 78% 18%, rgba(229,9,20,.13), transparent 25%), linear-gradient(145deg, #25252b 0%, #17171c 48%, #09090b 100%)" }}>
              <span className="absolute left-3 top-3 text-[9px] font-black tracking-[0.2em] text-zinc-500">CERITARIA</span>
              <span className="absolute bottom-2 right-3 text-4xl font-black text-black/35">{String(episode.episode_number).padStart(2, "0")}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 to-transparent" />
          <span className="absolute bottom-2 left-2 rounded-lg bg-black/80 px-2 py-1 text-[10px] font-black">EP {episode.episode_number}</span>
        </div>
        <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-5 transition group-hover:text-red-400 sm:mt-3">{episode.title}</h3>
        <p className="mt-1 line-clamp-1 text-[11px] text-zinc-500 sm:text-xs sm:text-zinc-400">{episode.seriesTitle}</p>
      </Link>
    </article>
  );
}
