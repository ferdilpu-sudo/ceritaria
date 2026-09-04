import type { Metadata } from "next";
import Link from "next/link";
import { CommunityProfileEditor } from "@/features/community/components/CommunityProfileEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profil Saya - Ceritaria",
  description: "Kelola identitas komunitas Ceritaria.",
};

export default function ProfilePage() {
  return (
    <div className="shell py-7 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex min-h-11 items-center text-sm font-bold text-zinc-400 hover:text-white">← Kembali</Link>
        <div className="mt-3">
          <p className="text-[10px] font-black tracking-[0.18em] text-red-400 sm:text-xs">KOMUNITAS</p>
          <h1 className="mt-1 text-3xl font-black sm:text-4xl">Profil Saya</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Atur foto, nama tampil, dan bio yang terlihat oleh penonton lain.</p>
        </div>
        <div className="mt-7"><CommunityProfileEditor /></div>
      </div>
    </div>
  );
}
