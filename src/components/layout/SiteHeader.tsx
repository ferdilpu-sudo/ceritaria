import Link from "next/link";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function SiteHeader({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  return (
    <header className={`sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(11,11,15,.92)] pt-[env(safe-area-inset-top)] backdrop-blur-xl ${hideOnMobile ? "hidden sm:block" : ""}`}>
      <div className="shell flex min-h-14 items-center justify-between gap-4 sm:min-h-16">
        <Link href="/" className="text-base font-black tracking-[0.2em] sm:text-xl" aria-label="CERITARIA beranda">
          CERITARIA
        </Link>

        <Link href="/search" className="grid h-11 w-11 place-items-center rounded-full bg-[var(--surface)] text-zinc-200 active:scale-95 sm:hidden" aria-label="Cari series atau episode">
          <SearchIcon />
        </Link>

        <form action="/search" className="hidden items-center gap-2 sm:flex">
          <label htmlFor="header-search" className="sr-only">Cari series atau episode</label>
          <input id="header-search" name="q" type="search" placeholder="Cari..." className="w-52 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" />
          <button className="min-h-11 rounded-xl bg-[var(--primary)] px-4 text-sm font-bold hover:bg-[var(--primary-hover)]">Cari</button>
        </form>
      </div>
    </header>
  );
}
