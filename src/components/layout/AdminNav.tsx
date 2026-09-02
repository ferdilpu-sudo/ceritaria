"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/features/admin/actions/auth-actions";
import { startAdminGuide } from "@/features/admin/components/AdminGuideTour";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true, guide: "nav-dashboard" },
  { href: "/admin/series", label: "Series", guide: "nav-series" },
  { href: "/admin/episodes", label: "Episode", guide: "nav-episodes" },
  { href: "/admin/analytics", label: "Analytics", guide: "nav-analytics" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/90 backdrop-blur">
      <div className="shell flex min-h-18 flex-wrap items-center gap-4 py-3">
        <Link href="/admin" className="mr-2 text-sm font-black tracking-[0.16em] text-[var(--text)] sm:text-base">
          CERITARIA <span className="text-red-600">ADMIN</span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm" aria-label="Navigasi admin">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-guide={item.guide}
                aria-current={active ? "page" : undefined}
                className={`min-h-11 shrink-0 rounded-xl border px-3 py-3 font-bold transition ${
                  active
                    ? "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-sm"
                    : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 shrink-0 rounded-xl border border-transparent px-3 py-3 font-bold text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
          >
            Lihat Situs ↗
          </Link>
        </nav>

        <button
          type="button"
          onClick={startAdminGuide}
          className="min-h-11 rounded-xl border border-[var(--border)] bg-white px-3 py-3 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--surface-2)]"
        >
          Panduan
        </button>

        <form action={logoutAction}>
          <button className="min-h-11 rounded-xl px-3 py-3 text-sm font-bold text-[var(--muted)] transition hover:bg-red-50 hover:text-red-700">
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
