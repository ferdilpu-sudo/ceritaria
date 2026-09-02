export type AdminGuideStep = {
  title: string;
  body: string;
  path: string;
  target: string;
};

export const adminGuideSteps: AdminGuideStep[] = [
  {
    title: "Dashboard",
    body: "Ini ringkasan kondisi konten. Dari sini kamu bisa melihat jumlah series dan episode, status draft/published, analytics singkat, serta pintasan membuat konten.",
    path: "/admin",
    target: '[data-guide="nav-dashboard"]',
  },
  {
    title: "Menu Series",
    body: "Mulai dari Series sebelum membuat episode. Series adalah wadah utama cerita, cover, hero, genre, sinopsis, status Featured, dan metadata SEO.",
    path: "/admin",
    target: '[data-guide="nav-series"]',
  },
  {
    title: "Informasi Series",
    body: "Isi Judul, lalu buat Slug seperti ana-dan-max. Tambahkan sinopsis singkat untuk kartu, sinopsis lengkap untuk halaman series, dan genre dipisahkan dengan koma.",
    path: "/admin/series/new",
    target: '[data-guide="series-info"]',
  },
  {
    title: "Media Series",
    body: "Upload cover untuk kartu katalog dan hero landscape untuk bagian unggulan. Pilih upload file atau URL. Tidak perlu mengisi keduanya untuk gambar yang sama.",
    path: "/admin/series/new",
    target: '[data-guide="series-media"]',
  },
  {
    title: "Publikasi Series & SEO",
    body: "Featured menonjolkan series di homepage. Published membuat series tampil ke publik. Saat masih mengecek, biarkan Published mati. SEO title dan description dipakai untuk mesin pencari.",
    path: "/admin/series/new",
    target: '[data-guide="series-publish"]',
  },
  {
    title: "Menu Episode",
    body: "Setelah series tersedia, masuk ke Episode untuk menambahkan video satu per satu. Setiap episode harus terhubung ke series yang benar.",
    path: "/admin",
    target: '[data-guide="nav-episodes"]',
  },
  {
    title: "Informasi Episode",
    body: "Pilih Series, isi nomor episode berurutan, judul, dan slug seperti episode-1. Sinopsis singkat akan membantu penonton memahami isi episode sebelum menonton.",
    path: "/admin/episodes/new",
    target: '[data-guide="episode-info"]',
  },
  {
    title: "Video & Media Episode",
    body: "Gunakan YouTube sebagai sumber utama, tempel URL video publik, isi durasi dalam detik bila diketahui, lalu upload thumbnail atau gunakan URL thumbnail.",
    path: "/admin/episodes/new",
    target: '[data-guide="episode-media"]',
  },
  {
    title: "Editorial Episode",
    body: "Recap berisi rangkuman cerita episode. Momen penting diisi satu poin per baris agar halaman episode punya konteks tambahan selain video.",
    path: "/admin/episodes/new",
    target: '[data-guide="episode-editorial"]',
  },
  {
    title: "Publikasi Episode & SEO",
    body: "Biarkan episode sebagai draft saat preview belum final. Aktifkan Published setelah URL video, thumbnail, judul, urutan, dan tampilan publik sudah benar. Lengkapi SEO bila diperlukan.",
    path: "/admin/episodes/new",
    target: '[data-guide="episode-publish"]',
  },
  {
    title: "Analytics",
    body: "Di sini kamu memantau visitor realtime, pageview, sesi, halaman populer, perangkat, referrer, dan event. Gunakan data ini untuk melihat episode mana yang paling menarik penonton.",
    path: "/admin/analytics",
    target: '[data-guide="nav-analytics"]',
  },
];
