"use client";

import Image from "next/image";

interface InstallAppCtaProps {
  onInstall: () => Promise<void>;
  onDismiss: () => void;
}

function Benefit({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-bold text-zinc-300">
      <span className="text-emerald-400" aria-hidden="true">✓</span>
      {children}
    </span>
  );
}

export function InstallAppCta({ onInstall, onDismiss }: InstallAppCtaProps) {
  return (
    <aside
      aria-labelledby="install-ceritaria-title"
      className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[70] mx-auto max-w-md overflow-hidden rounded-[24px] border border-white/10 bg-[#15151b]/97 shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[380px]"
    >
      <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-rose-400" />
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[16px] border border-white/10 bg-black shadow-lg">
            <Image src="/icons/icon-192.png" alt="" fill sizes="56px" className="object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black tracking-[0.16em] text-red-400">CERITARIA APP</p>
            <h2 id="install-ceritaria-title" className="mt-0.5 text-[17px] font-black leading-6 text-white">Nonton lebih nyaman dari layar utama</h2>
            <p className="mt-1 text-[12px] leading-5 text-zinc-400">Pasang Ceritaria seperti aplikasi. Lebih cepat dibuka dan tampil tanpa address bar browser.</p>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Tutup ajakan memasang Ceritaria"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl text-zinc-400 transition active:scale-95 hover:bg-white/[0.06] hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Benefit>Akses cepat</Benefit>
          <Benefit>Layar penuh</Benefit>
          <Benefit>Lanjut nonton mudah</Benefit>
        </div>

        <div className="mt-4 grid grid-cols-[0.8fr_1.4fr] gap-2.5">
          <button
            type="button"
            onClick={onDismiss}
            className="min-h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-zinc-300 transition active:scale-[0.98] hover:bg-white/[0.08]"
          >
            Nanti
          </button>
          <button
            type="button"
            onClick={() => void onInstall()}
            className="min-h-12 rounded-xl bg-[var(--primary)] px-4 text-sm font-black text-white shadow-lg shadow-red-950/30 transition active:scale-[0.98] hover:bg-[var(--primary-hover)]"
          >
            Pasang Ceritaria
          </button>
        </div>

        <p className="mt-3 text-center text-[10px] leading-4 text-zinc-500">Gratis. Bisa dihapus kapan saja dari perangkat.</p>
      </div>
    </aside>
  );
}
