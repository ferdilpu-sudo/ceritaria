export default function SearchLoading() {
  return (
    <div className="shell py-5 sm:py-10" aria-live="polite" aria-label="Memuat pencarian">
      <div className="h-8 w-28 animate-pulse rounded-lg bg-zinc-800" />
      <div className="mt-4 h-16 max-w-2xl animate-pulse rounded-2xl bg-zinc-900" />
      <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[1, 2, 3, 4].map((item) => <div key={item} className="aspect-[2/3] animate-pulse rounded-2xl bg-zinc-900" />)}
      </div>
    </div>
  );
}
