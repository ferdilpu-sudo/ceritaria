"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="shell grid min-h-[60vh] place-items-center py-12 text-center">
      <div>
        <h1 className="text-3xl font-black">CERITARIA sedang bermasalah</h1>
        <p className="mt-3 muted">Konten belum bisa dimuat. Silakan coba kembali tanpa kehilangan alur navigasi utama CERITARIA.</p>
        <button type="button" onClick={reset} className="mt-6 min-h-12 rounded-xl bg-[var(--primary)] px-5 font-bold">
          Coba lagi
        </button>
      </div>
    </main>
  );
}
