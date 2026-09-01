import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import type { PublicSeries } from "@/features/series/types/series";

export function SeriesCard({ series }: { series: PublicSeries }) {
  return (
    <article>
      <Link href={`/series/${series.slug}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl surface">
          <MediaImage src={series.cover_url} alt={`Poster ${series.title}`} className="transition duration-300 group-hover:scale-[1.02]" />
        </div>
        <h3 className="mt-3 line-clamp-2 font-bold group-hover:text-red-400">{series.title}</h3>
        {series.genres.length > 0 && <p className="mt-1 line-clamp-1 text-xs muted">{series.genres.join(" • ")}</p>}
      </Link>
    </article>
  );
}
