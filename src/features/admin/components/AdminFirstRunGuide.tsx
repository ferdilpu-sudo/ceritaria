"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "ceritaria-admin-guide-seen-v1";

const steps = [
  {
    title: "Buat Series lebih dulu",
    body: "Isi judul, slug, sinopsis, genre, cover, dan hero. Simpan sebagai draft sampai tampilannya sudah benar.",
    href: "/admin/series/new",
    action: "Buat Series",
  },
  {
    title: "Tambahkan Episode",
    body: "Pilih series, isi nomor episode, judul, slug, URL YouTube, thumbnail, lalu lengkapi recap atau momen penting bila diperlukan.",
    href: "/admin/episodes/new",
    action: "Buat Episode",
  },
  {
    title: "Preview sebelum Published",
    body: "Gunakan preview di sisi kanan form. Aktifkan Published hanya setelah video, gambar, judul, dan urutan episode sudah benar.",
    href: "/",
    action: "Lihat Situs",
    external: true,
  },
  {
    title: "Pantau Analytics",
    body: "Setelah konten tayang, cek pengunjung, pageview, halaman populer, perangkat, referrer, dan aktivitas realtime.",
    href: "/admin/analytics",
    action: "Buka Analytics",
  },
];

export function AdminFirstRunGuide() {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(window.localStorage.getItem(STORAGE_KEY) !== "seen");
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, "seen");
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--surface-2)]"
      >
        Panduan Admin
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-guide-title"
            className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[var(--border)] bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black tracking-[0.18em] text-red-600">QUICK START</p>
                <h2 id="admin-guide-title" className="mt-2 text-2xl font-black text-[var(--text)] sm:text-3xl">
                  Cara mengisi admin CERITARIA
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  Urutan paling aman: buat series, tambah episode, cek preview, baru publish. SEO bisa dilengkapi setelah konten utama beres.
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={dismiss}
                aria-label="Tutup panduan"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--border)] text-xl text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              >
                ×
              </button>
            </div>

            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {steps.map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-red-600 text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <h3 className="font-black text-[var(--text)]">{step.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{step.body}</p>
                  <Link
                    href={step.href}
                    target={step.external ? "_blank" : undefined}
                    rel={step.external ? "noopener noreferrer" : undefined}
                    className="mt-4 inline-flex min-h-10 items-center rounded-lg font-bold text-red-700 hover:text-red-800"
                  >
                    {step.action} →
                  </Link>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <strong>Tip:</strong> gunakan <strong>Featured</strong> hanya untuk series yang ingin ditonjolkan di homepage. Biarkan <strong>Published</strong> mati selama masih mengecek konten.
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={dismiss}
                className="min-h-11 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--primary-hover)]"
              >
                Mengerti, mulai kelola konten
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
