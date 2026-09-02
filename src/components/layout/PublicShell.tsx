"use client";

import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

function isEpisodePlayback(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts[0] === "series" && parts.length >= 3;
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const playback = isEpisodePlayback(pathname);

  return (
    <>
      {!playback && <SiteHeader />}
      <main className={playback ? "min-h-dvh" : "public-mobile-main"}>{children}</main>
      <SiteFooter />
      {!playback && <MobileBottomNav />}
    </>
  );
}
