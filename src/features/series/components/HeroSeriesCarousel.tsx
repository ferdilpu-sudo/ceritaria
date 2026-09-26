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

      <div className="pointer-events-none absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
        <span className="rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-black tabular-nums text-white backdrop-blur-md">
          <span className="sm:hidden">Geser · </span>{activeIndex + 1} / {series.length}
        </span>

        <div className="pointer-events-auto hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex - 1)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-md transition hover:bg-black/75 active:scale-95"
            aria-label="Series sebelumnya"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex + 1)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-md transition hover:bg-black/75 active:scale-95"
            aria-label="Series berikutnya"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-4">
        {series.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToIndex(index)}
            className="grid h-8 w-8 place-items-center rounded-full"
            aria-label={`Tampilkan ${item.title}`}
            aria-current={activeIndex === index ? "true" : undefined}
          >
            <span className={`h-2.5 rounded-full border border-white/25 shadow-sm transition-all ${activeIndex === index ? "w-6 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70"}`} />
          </button>
        ))}
      </div>

      <p className="sr-only">Geser ke kiri atau kanan untuk melihat series lainnya.</p>
    </section>
  );
}
