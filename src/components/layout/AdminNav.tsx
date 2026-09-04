"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/features/admin/actions/auth-actions";
import { startAdminGuide } from "@/features/admin/components/AdminGuideTour";

type IconName = "home" | "series" | "episode" | "community" | "analytics";

const navItems = [
  { href: "/admin", label: "Beranda", desktopLabel: "Dashboard", exact: true, guide: "nav-dashboard", icon: "home" as IconName },
  { href: "/admin/series", label: "Series", desktopLabel: "Series", guide: "nav-series", icon: "series" as IconName },
  { href: "/admin/episodes", label: "Episode", desktopLabel: "Episode", guide: "nav-episodes", icon: "episode" as IconName },
  { href: "/admin/community", label: "Komentar", desktopLabel: "Komunitas", guide: "nav-community", icon: "community" as IconName },
  { href: "/admin/analytics", label: "Analytics", desktopLabel: "Analytics", guide: "nav-analytics", icon: "analytics" as IconName },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

function NavIcon({ name }: { name: IconName }) {
  if (name === "home") return <path d="M3 10.7 12 3l9 7.7V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.7Z" />;
  if (name === "series") return <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>;
  if (name === "episode") return <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3V9Z" /></>;
  if (name === "community") return <><path d="M4 5h16v11H9l-5 4V5Z" /><path d="M8 9h8M8 12h5" /></>;
  return <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /><path d="M3 7.5 9 3l6 6 6-5" /></>;
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl sm:hidden">
        <div className="flex min-h-14 items-center justify-between gap-3 px-4">
          <Link href="/admin" className="min-w-0 truncate text-[13px] font-black tracking-[0.17em] text-[var(--text)]">
            CERITARIA <span className="text-red-600">ADMIN</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" onClick={startAdminGuide} aria-label="Buka panduan admin"
              className="grid h-11 w-11 place-items-center rounded-full text-[var(--muted)] active:bg-[var(--surface-2)]">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 3.8 2c-1 .7-1.6 1.1-1.6 2.4M12 17h.01" />
              </svg>
            </button>
            <form action={logoutAction}>
              <button aria-label="Keluar dari admin" className="grid h-11 w-11 place-items-center rounded-full text-[var(--muted)] active:bg-red-50 active:text-red-700">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
                  <path d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5M14 8l4 4-4 4M18 12H8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      <header className="sticky top-0 z-40 hidden border-b border-[var(--border)] bg-white/90 backdrop-blur sm:block">
        <div className="shell flex min-h-18 items-center gap-4 py-3">
          <Link href="/admin" className="mr-2 text-sm font-black tracking-[0.16em] text-[var(--text)] sm:text-base">
            CERITARIA <span className="text-red-600">ADMIN</span>
          </Link>
          <nav className="flex min-w-0 flex-1 items-center gap-1 text-sm" aria-label="Navigasi admin desktop">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              return (
                <Link key={item.href} href={item.href} data-guide={item.guide} aria-current={active ? "page" : undefined}
                  className={`min-h-11 rounded-xl border px-3 py-3 font-bold transition ${active ? "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-sm" : "border-transparent text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"}`}>
                  {item.desktopLabel}
                </Link>
              );
            })}
            <Link href="/" target="_blank" rel="noopener noreferrer" className="min-h-11 rounded-xl px-3 py-3 font-bold text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]">
              Lihat Situs ↗
            </Link>
          </nav>
          <button type="button" onClick={startAdminGuide} className="min-h-11 rounded-xl border border-[var(--border)] bg-white px-3 py-3 text-sm font-bold text-[var(--text)] hover:bg-[var(--surface-2)]">Panduan</button>
          <form action={logoutAction}><button className="min-h-11 rounded-xl px-3 py-3 text-sm font-bold text-[var(--muted)] hover:bg-red-50 hover:text-red-700">Keluar</button></form>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:hidden" aria-label="Navigasi admin mobile">
        <div className="grid grid-cols-5">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link key={item.href} href={item.href} data-guide={item.guide} aria-current={active ? "page" : undefined}
                className={`relative flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 px-1 text-[9px] font-bold transition ${active ? "text-red-600" : "text-[var(--muted)] active:bg-[var(--surface-2)]"}`}>
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-red-600" />}
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <NavIcon name={item.icon} />
                </svg>
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
