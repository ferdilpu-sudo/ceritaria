export default function EpisodeLoading() {
  return (
    <div className="shell pb-8 pt-2 sm:pt-9" aria-live="polite" aria-label="Memuat episode">
      <div className="mb-2 h-11 w-40 animate-pulse rounded-xl bg-zinc-900 sm:hidden" />
      <div className="grid gap-5 sm:gap-8 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] lg:gap-12">
        <div className="-mx-4 aspect-[9/16] animate-pulse bg-zinc-950 sm:mx-0 sm:rounded-[26px]" />
        <div className="min-w-0 pt-1">
          <div className="h-3 w-24 animate-pulse rounded bg-red-950" />
          <div className="mt-3 h-9 w-4/5 animate-pulse rounded-lg bg-zinc-800" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-zinc-900" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-zinc-900" />
          <div className="mt-6 grid grid-cols-2 gap-3"><div className="h-13 animate-pulse rounded-2xl bg-zinc-900" /><div className="h-13 animate-pulse rounded-2xl bg-red-950" /></div>
        </div>
      </div>
    </div>
  );
}
