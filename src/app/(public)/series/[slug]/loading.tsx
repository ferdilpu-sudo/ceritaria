export default function SeriesLoading() {
  return (
    <div className="shell pb-8 pt-0 sm:py-8" aria-live="polite" aria-label="Memuat series">
      <div className="-mx-4 h-[40dvh] animate-pulse bg-zinc-900 sm:mx-0 sm:h-[360px] sm:rounded-3xl" />
      <div className="mt-6 h-7 w-44 animate-pulse rounded-lg bg-zinc-800" />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="aspect-[9/16] animate-pulse rounded-2xl bg-zinc-900" />)}
      </div>
    </div>
  );
}
