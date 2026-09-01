import { EpisodeCard } from "@/features/episode/components/EpisodeCard";
import { SeriesCard } from "@/features/series/components/SeriesCard";
import { searchPublishedContent } from "@/features/series/services/search-content";

interface Props { searchParams: Promise<{ q?: string }>; }
export const metadata = { title: "Pencarian", alternates: { canonical: "/search" }, robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = await searchPublishedContent(query);
  const hasResults = results.series.length + results.episodes.length > 0;

  return (
    <div className="shell py-5 sm:py-10">
      <div className="mx-auto max-w-2xl sm:mx-0">
        <p className="text-[10px] font-black tracking-[0.2em] text-red-400 sm:hidden">TEMUKAN CERITA</p>
        <h1 className="mt-1 text-[28px] font-black sm:mt-0 sm:text-3xl">Cari</h1>
        <form action="/search" className="surface mt-4 flex items-center gap-2 rounded-2xl p-2 sm:mt-5">
          <label htmlFor="search-page-input" className="sr-only">Cari series atau episode</label>
          <svg viewBox="0 0 24 24" className="ml-2 h-5 w-5 shrink-0 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
          <input id="search-page-input" name="q" type="search" defaultValue={query} placeholder="Judul series atau episode" className="min-h-11 min-w-0 flex-1 bg-transparent px-1 text-base outline-none placeholder:text-zinc-600" />
          <button className="min-h-11 rounded-xl bg-[var(--primary)] px-4 text-sm font-black active:scale-[0.98]">Cari</button>
        </form>
      </div>

      {!query ? <p className="mt-7 text-sm text-zinc-400">Cari judul series, episode, atau cerita yang ingin kamu lanjutkan.</p> : query.length < 2 ? <p className="mt-7">Masukkan minimal 2 karakter.</p> : !hasResults ? <p className="mt-7 muted">Tidak ada hasil untuk “{query}”.</p> : <>
        {results.series.length > 0 && <section className="mt-9 sm:mt-10"><h2 className="mb-4 text-xl font-black sm:mb-5">Series</h2><div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">{results.series.map((series) => <SeriesCard key={series.id} series={series} />)}</div></section>}
        {results.episodes.length > 0 && <section className="mt-10 sm:mt-12"><h2 className="mb-4 text-xl font-black sm:mb-5">Episode</h2><div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">{results.episodes.map((episode) => <EpisodeCard key={episode.id} episode={episode} />)}</div></section>}
      </>}
    </div>
  );
}
