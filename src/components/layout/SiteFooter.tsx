import Link from "next/link";

const links = [
  ["Tentang", "/about"], ["Kontak", "/contact"], ["Privasi", "/privacy"], ["Ketentuan", "/terms"],
] as const;

export function SiteFooter({ mobileNavInset = true }: { mobileNavInset?: boolean }) {
  const mobilePadding = mobileNavInset ? "pb-[calc(6rem+env(safe-area-inset-bottom))]" : "pb-6";

  return (
    <footer className={`mt-12 border-t border-[var(--border)] pt-7 sm:mt-20 sm:py-10 ${mobilePadding}`}>
      <div className="shell flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden sm:block">
          <p className="font-black tracking-[0.15em]">CERITARIA</p>
          <p className="mt-1 text-sm muted">Mini series tersusun rapi agar mudah diikuti dari episode ke episode.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs text-zinc-400 sm:justify-start sm:text-sm">
          {links.map(([label, href]) => <Link key={href} href={href} className="min-h-11 py-3 hover:text-white">{label}</Link>)}
        </nav>
      </div>
    </footer>
  );
}
