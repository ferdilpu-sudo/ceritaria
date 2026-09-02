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
    body: "Buat Series lebih dulu karena episode harus masuk ke sebuah series. Setelah series tersedia, kamu tidak perlu mengulang pengaturan ini untuk setiap episode.",
    path: "/admin",
    target: '[data-guide="nav-series"]',
  },
  {
    title: "Informasi Series",
    body: "Isi judul sebagai data wajib. Slug/URL dibuat otomatis dari judul. Sinopsis dan genre boleh dilengkapi untuk membantu penonton memahami cerita.",
    path: "/admin/series/new",
    target: '[data-guide="series-info"]',
  },
  {
    title: "Media Series",
    body: "Tekan Pilih gambar untuk mengunggah cover dan hero. Cover sebaiknya poster 2:3, sedangkan hero sebaiknya landscape 16:9. URL manual tidak perlu diisi jika memakai upload.",
    path: "/admin/series/new",
    target: '[data-guide="series-media"]',
  },
  {
    title: "Publikasi Series",
    body: "Biarkan Published mati selama masih mengecek series. Aktifkan Featured hanya untuk series yang ingin ditonjolkan di homepage.",
    path: "/admin/series/new",
    target: '[data-guide="series-publish"]',
  },
  {
    title: "Pengaturan Lanjutan Series",
    body: "Bagian ini biasanya tidak perlu disentuh. Buka hanya jika ingin mengubah slug otomatis, memakai URL gambar manual, atau mengisi metadata SEO.",
    path: "/admin/series/new",
    target: '[data-guide="series-advanced"]',
  },
  {
    title: "Menu Episode",
    body: "Ini menu yang paling sering dipakai setelah series dibuat. Tambahkan setiap video sebagai satu episode agar urutan cerita dan analytics tetap rapi.",
    path: "/admin",
    target: '[data-guide="nav-episodes"]',
  },
  {
    title: "Informasi Episode",
    body: "Pilih series yang benar. Nomor episode akan disarankan otomatis dari episode terakhir. Isi judul, lalu slug/URL episode dibuat otomatis di belakang layar.",
    path: "/admin/episodes/new",
    target: '[data-guide="episode-info"]',
  },
  {
    title: "Video & Thumbnail",
    body: "Tempel URL YouTube publik, lalu pilih thumbnail. Durasi boleh diisi dengan format menit:detik seperti 10:30. Preview membantu memastikan video yang ditempel sudah benar.",
    path: "/admin/episodes/new",
    target: '[data-guide="episode-media"]',
  },
  {
    title: "Recap & Momen Penting",
    body: "Bagian ini opsional dan sengaja dilipat. Buka jika ingin menambahkan recap atau momen penting. Isi satu momen per baris agar mudah dibaca.",
    path: "/admin/episodes/new",
    target: '[data-guide="episode-editorial"]',
  },
  {
    title: "Publikasi Episode",
    body: "Biarkan sebagai Draft ketika video atau thumbnail belum final. Aktifkan Published hanya setelah preview dan urutan episode sudah benar.",
    path: "/admin/episodes/new",
    target: '[data-guide="episode-publish"]',
  },
  {
    title: "Pengaturan Lanjutan Episode",
    body: "Buka hanya bila perlu mengubah slug, memakai Facebook legacy, memakai URL thumbnail manual, atau mengisi SEO. Untuk posting harian, bagian ini biasanya bisa dilewati.",
    path: "/admin/episodes/new",
    target: '[data-guide="episode-advanced"]',
  },
  {
    title: "Analytics",
    body: "Setelah konten tayang, pantau visitor realtime, pageview, halaman populer, perangkat, referrer, dan event untuk melihat episode mana yang paling menarik penonton.",
    path: "/admin/analytics",
    target: '[data-guide="nav-analytics"]',
  },
];
