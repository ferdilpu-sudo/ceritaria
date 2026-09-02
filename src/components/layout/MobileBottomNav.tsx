"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const items = [
  { href: "/", label: "Beranda", key: "home" },
  { href: "/#semua-series", label: "Series", key: "series" },
  { href: "/search", label: "Cari", key: "search" },
  { href: "/lanjut", label: "Lanjut", key: "continue" },
] as const;

type NavKey = (typeof items)[number]["key"];

function isActive(pathname: string, hash: string, key: NavKey) {
  if (key === "home") return pathname === "/" && hash !== "#semua-series";
  if (key === "series") return pathname.startsWith("/series") || (pathname === "/" && hash === "#semua-series");
  if (key === "search") return pathname.startsWith("/search");
  return pathname.startsWith("/lanjut");
}

function NavIcon({ name }: { name: NavKey }) {
  const paths: Record<NavKey, React.ReactNode> = {
    home: <><path d="M3.5 10.5 12 3.6l8.5 6.9"/><path d="M5.5 9.2V20h13V9.2"/><path d="M9.4 20v-6.2h5.2V20"/></>,
    series: <><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m10 8 6 4-6 4V8Z"/></>,
    search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.2 4.2"/></>,
    continue: <><path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v5h5"/><path d="m10.5 9 5 3-5 3V9Z"/></>,
  };

  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0b0b0f]/95 pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1.5 backdrop-blur-xl sm:hidden" aria-label="Navigasi utama mobile">
      <div className="mx-auto grid max-w-md grid-cols-4 px-2">
        {items.map((item) => {
          const active = isActive(pathname, hash, item.key);
          return (
            <Link key={item.key} href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold transition active:scale-95 ${active ? "text-white" : "text-zinc-400"}`}>
              <span className={`grid h-8 w-11 place-items-center rounded-full transition ${active ? "bg-red-600/15 text-red-400" : ""}`}>
                <NavIcon name={item.key} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
