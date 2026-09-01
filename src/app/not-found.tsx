import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell grid min-h-[60vh] place-items-center py-12 text-center">
      <div>
        <p className="text-7xl font-black text-red-500">404</p>
        <h1 className="mt-4 text-2xl font-black">Konten tidak ditemukan</h1>
        <p className="mt-3 muted">Mungkin belum dipublikasikan, sudah dihapus, atau URL-nya salah.</p>
        <Link href="/" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-[var(--primary)] px-5 font-bold">
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
