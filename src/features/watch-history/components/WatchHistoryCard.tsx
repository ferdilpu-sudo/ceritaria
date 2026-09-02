"use client";

import Image from "next/image";
import Link from "next/link";
import type { WatchHistoryItem } from "@/features/watch-history/services/watch-history";

export function WatchHistoryCard({ item }: { item: WatchHistoryItem }) {
  return (
    <article className="w-[72vw] max-w-[310px] shrink-0 snap-start sm:w-[320px]">
      <Link
        href={`/series/${item.seriesSlug}/${item.episodeSlug}`}
        className="group block overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface)] active:scale-[0.985]"
      >
        <div className="flex min-h-[132px]">
          <div className="relative w-[92px] shrink-0 bg-zinc-950 sm:w-[104px]">
            {item.thumbnailUrl ? (
              <Image src={item.thumbnailUrl} alt={`Thumbnail ${item.episodeTitle}`} fill sizes="104px" className="object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-zinc-800 to-black text-xs font-black text-zinc-500">EP {item.episodeNumber}</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-1 text-[10px] font-black">EP {item.episodeNumber}</span>
          </div>
          <div className="min-w-0 flex-1 p-4">
            <p className="text-[10px] font-black tracking-[0.14em] text-red-400">LANJUT NONTON</p>
            <h3 className="mt-1.5 line-clamp-2 text-sm font-black leading-5 text-white group-hover:text-red-300">{item.episodeTitle}</h3>
            <p className="mt-1 line-clamp-1 text-xs text-zinc-400">{item.seriesTitle}</p>
            <span className="mt-4 inline-flex min-h-9 items-center rounded-lg bg-white px-3 text-xs font-black text-black">▶ Lanjutkan</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
