import Image from "next/image";
import Link from "next/link";
import type { PublicSeries } from "@/features/series/types/series";

export function HomeSeriesCard({ series }: { series: PublicSeries }) {
  return (
    <article className="min-w-0">
      <Link href={`/series/${series.slug}`} className="group block rounded-[20px] focus-visible:outline-offset-4 active:scale-[0.985] sm:rounded-2xl">
        <div className="surface relative aspect-[2/3] overflow-hidden rounded-[20px] bg-zinc-950 sm:rounded-2xl">
          {series.cover_url ? (
            <Image src={series.cover_url} alt={`Poster ${series.title}`} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition duration-300 group-hover:scale-[1.025]" />
          ) : (
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 75% 22%, rgba(229,9,20,.12), transparent 28%), linear-gradient(145deg, #29292f 0%, #18181d 52%, #0c0c0f 100%)" }}>
              <span className="absolute inset-0 grid place-items-center text-[10px] font-black tracking-[0.22em] text-zinc-500">CERITARIA</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition group-hover:opacity-100" />
        </div>
        <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-5 transition group-hover:text-red-400 sm:mt-3 sm:text-base">{series.title}</h3>
        {series.genres.length > 0 && <p className="mt-1 line-clamp-1 text-[11px] text-zinc-500 sm:mt-1.5 sm:text-xs sm:text-zinc-400">{series.genres.join(" • ")}</p>}
      </Link>
    </article>
  );
}
