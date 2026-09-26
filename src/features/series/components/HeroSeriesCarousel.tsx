"use client";

import { useRef, useState } from "react";
import { HeroSeries } from "@/features/series/components/HeroSeries";
import type { PublicSeries } from "@/features/series/types/series";

interface HeroSeriesCarouselProps {
  series: PublicSeries[];
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

export function HeroSeriesCarousel({ series }: HeroSeriesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (series.length === 0) return null;

  const scrollToIndex = (nextIndex: number) => {
    const track = trackRef.current;
    if (!track) return;

    const index = (nextIndex + series.length) % series.length;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    track.scrollTo({
      left: index * track.clientWidth,
      behavior: reduceMotion ? "auto" : "smooth",
    });
    setActiveIndex(index);
  };

  const syncActiveSlide = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth <= 0) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(Math.max(0, Math.min(series.length - 1, index)));
  };

  if (series.length === 1) {
    return <HeroSeries series={series[0]} priority />;
  }

  return (
    <section className="relative" aria-label="Pilihan series Ceritaria" aria-roledescription="carousel">
      <div
        ref={trackRef}
        onScroll={syncActiveSlide}
        className="mobile-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {series.map((item, index) => (
          <div
            key={item.id}
            className="min-w-full snap-center snap-always"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} dari ${series.length}: ${item.title}`}
          >
            <HeroSeries
              series={item}
              eyebrow={item.is_featured ? "SERIES UNGGULAN" : "PILIHAN CERITARIA"}
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <span className="pointer-events-none absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-black tabular-nums text-white backdrop-blur-md sm:right-6 sm:top-6">
        {activeIndex + 1} / {series.length}
      </span>

      <button
        type="button"
        onClick={() => scrollToIndex(activeIndex - 1)}
        className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/55 text-white shadow-lg backdrop-blur-md transition hover:bg-black/75 active:scale-95 sm:grid"
        aria-label="Series sebelumnya"
      >
        <ArrowIcon direction="left" />
      </button>

      <button
        type="button"
        onClick={() => scrollToIndex(activeIndex + 1)}
        className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/55 text-white shadow-lg backdrop-blur-md transition hover:bg-black/75 active:scale-95 sm:grid"
        aria-label="Series berikutnya"
      >
        <ArrowIcon direction="right" />
      </button>

      <div className="flex items-center justify-center gap-1 px-3 pt-2 sm:pt-3">
        {series.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToIndex(index)}
            className="grid h-9 w-9 place-items-center rounded-full"
            aria-label={`Tampilkan ${item.title}`}
            aria-current={activeIndex === index ? "true" : undefined}
          >
            <span className={`h-2 rounded-full transition-all ${activeIndex === index ? "w-6 bg-white" : "w-2 bg-zinc-600 hover:bg-zinc-400"}`} />
          </button>
        ))}
      </div>

      <p className="sr-only">Geser ke kiri atau kanan untuk melihat series lainnya.</p>
    </section>
  );
}
