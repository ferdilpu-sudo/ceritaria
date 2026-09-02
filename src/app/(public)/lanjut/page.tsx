"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WatchHistoryCard } from "@/features/watch-history/components/WatchHistoryCard";
import { clearWatchHistory, readWatchHistory, subscribeWatchHistory, type WatchHistoryItem } from "@/features/watch-history/services/watch-history";

export default function ContinueWatchingPage() {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readWatchHistory());
    sync();
    return subscribeWatchHistory(sync);
  }, []);

  return (
    <div className="shell py-5 sm:py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-red-400 sm:text-xs">RIWAYAT DI PERANGKAT INI</p>
          <h1 className="mt-1 text-[28px] font-black sm:text-3xl">Lanjut Nonton</h1>
        </div>
        {items.length > 0 && (
          <button type="button" onClick={() => clearWatchHistory()} className="min-h-11 rounded-xl px-3 text-sm font-bold text-zinc-400 hover:text-white">
            Hapus riwayat
          </button>
        )}
      </div>

      {items.length ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={`${item.seriesSlug}/${item.episodeSlug}`} className="min-w-0 [&>article]:w-full [&>article]:max-w-none">
              <WatchHistoryCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="surface mt-7 rounded-2xl p-7 text-center">
          <p className="font-black">Belum ada episode yang bisa dilanjutkan</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">Episode yang kamu buka akan muncul di sini agar mudah ditemukan lagi di perangkat ini.</p>
          <Link href="/#semua-series" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--primary)] px-5 text-sm font-black text-white">Jelajahi Series</Link>
        </div>
      )}
    </div>
  );
}
