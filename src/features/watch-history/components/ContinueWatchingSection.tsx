"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WatchHistoryCard } from "@/features/watch-history/components/WatchHistoryCard";
import { readWatchHistory, subscribeWatchHistory, type WatchHistoryItem } from "@/features/watch-history/services/watch-history";

export function ContinueWatchingSection() {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readWatchHistory());
    sync();
    return subscribeWatchHistory(sync);
  }, []);

  if (!items.length) return null;

  return (
    <section id="lanjut-nonton" className="mt-8 scroll-mt-20 sm:mt-14 sm:scroll-mt-24" aria-labelledby="continue-watching-title">
      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
        <div>
          <p className="text-[10px] font-black tracking-[0.18em] text-red-400 sm:text-xs">TERAKHIR DIBUKA</p>
          <h2 id="continue-watching-title" className="mt-1 text-[22px] font-black sm:text-2xl">Lanjut Nonton</h2>
        </div>
        <Link href="/lanjut" className="min-h-11 rounded-lg px-2 py-3 text-sm font-bold text-zinc-400 hover:text-white">Semua →</Link>
      </div>
      <div className="mobile-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:gap-4 sm:px-0">
        {items.slice(0, 6).map((item) => <WatchHistoryCard key={`${item.seriesSlug}/${item.episodeSlug}`} item={item} />)}
      </div>
    </section>
  );
}
