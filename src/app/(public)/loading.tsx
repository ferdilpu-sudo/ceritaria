export default function PublicLoading() {
  return (
    <div className="shell pb-8 pt-0 sm:py-10" aria-live="polite" aria-label="Memuat Ceritaria">
      <div className="-mx-4 h-[56dvh] animate-pulse bg-zinc-900 sm:mx-0 sm:h-[410px] sm:rounded-[28px]" />
      <div className="mt-8 h-6 w-40 animate-pulse rounded-lg bg-zinc-800" />
      <div className="mt-4 flex gap-3 overflow-hidden">
        {[1, 2, 3].map((item) => <div key={item} className="h-56 w-36 shrink-0 animate-pulse rounded-2xl bg-zinc-900" />)}
      </div>
    </div>
  );
}
