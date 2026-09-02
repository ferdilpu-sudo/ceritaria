export type AdminGuideStep = {
  title: string;
  body: string;
  path: string;
  target: string;
};

export const adminGuideSteps: AdminGuideStep[] = [
  {
    title: "Beranda Admin",
    body: "Di sini kamu bisa melihat ringkasan isi CERITARIA: berapa series dan episode yang sudah tayang, yang masih disimpan, serta jumlah penonton. Tombol + Series dan + Episode bisa dipakai untuk menambah konten baru.",
    path: "/admin",
    target: '[data-guide="nav-dashboard"]',
  },
  {
    title: "Series",
    body: "Buat Series terlebih dahulu sebagai rumah untuk kumpulan episode. Contohnya, buat satu series bernama Ana & Max, lalu semua episode Ana & Max dimasukkan ke series tersebut.",
    path: "/admin",
    target: '[data-guide="nav-series"]',
  },
  {
    title: "Isi Data Series",
    body: "Mulai dengan menulis judul series. Ringkasan, sinopsis lengkap, dan genre boleh diisi agar penonton lebih mudah memahami ceritanya. Alamat halaman akan dibuat otomatis dari judul, jadi kamu tidak perlu mengaturnya sendiri.",
    path: "/admin/series/new",
    target: '[data-guide="series-info"]',
  },
  {
    title: "Pasang Cover dan Gambar Utama",
    body: "Pilih gambar cover yang akan terlihat di daftar series. Untuk gambar utama di bagian atas halaman, pilih foto melebar atau landscape. Cukup unggah gambarnya dari perangkatmu.",
    path: "/admin/series/new",
    target: '[data-guide="series-media"]',
  },
  {
    title: "Tayangkan Series",
    body: "Biarkan Published tidak aktif kalau series masih ingin diperiksa. Aktifkan Published saat series sudah siap dilihat penonton. Aktifkan Series unggulan hanya jika ingin series tersebut lebih ditonjolkan di beranda.",
    path: "/admin/series/new",
    target: '[data-guide="series-publish"]',
  },
  {
    title: "Pengaturan Tambahan Series",
    body: "Bagian ini tidak wajib diisi. Gunakan hanya jika kamu ingin mengganti alamat halaman secara manual, memakai gambar dari link internet, atau mengatur judul dan deskripsi yang tampil di Google.",
    path: "/admin/series/new",
    target: '[data-guide="series-advanced"]',
  },
  {
    title: "Episode",
    body: "Setelah Series dibuat, kamu akan lebih sering memakai menu Episode. Setiap video cerita dibuat sebagai satu episode dan dimasukkan ke Series yang sesuai.",
    path: "/admin",
    target: '[data-guide="nav-episodes"]',
  },
  {
    title: "Isi Data Episode",
    body: "Pilih Series tempat episode ini berada. Nomor episode berikutnya akan terisi otomatis, tetapi tetap bisa kamu ubah jika perlu. Setelah itu isi judul dan, bila ingin, tambahkan ringkasan singkat.",
    path: "/admin/episodes/new",
    target: '[data-guide="episode-info"]',
  },
  {
    title: "Masukkan Video dan Thumbnail",
    body: "Tempel link video YouTube yang sudah kamu upload, lalu pilih gambar thumbnail dari perangkat. Jika tahu durasinya, kamu bisa mengisinya seperti 10:30. Preview video akan muncul agar kamu bisa memastikan videonya benar.",
    path: "/admin/episodes/new",
    target: '[data-guide="episode-media"]',
  },
  {
    title: "Tambahkan Ringkasan Cerita",
    body: "Bagian ini boleh dilewati. Gunakan Recap jika ingin menuliskan rangkuman episode, dan Momen penting jika ingin mencatat kejadian penting. Untuk Momen penting, tulis satu kejadian di setiap baris.",
    path: "/admin/episodes/new",
    target: '[data-guide="episode-editorial"]',
  },
  {
    title: "Tayangkan Episode",
    body: "Simpan sebagai Draft kalau masih ingin mengecek video, thumbnail, atau judul. Aktifkan Published hanya ketika episode sudah benar-benar siap ditonton oleh pengunjung CERITARIA.",
    path: "/admin/episodes/new",
    target: '[data-guide="episode-publish"]',
  },
  {
    title: "Pengaturan Tambahan Episode",
    body: "Bagian ini biasanya tidak perlu diubah saat upload episode biasa. Buka hanya jika ingin mengganti alamat halaman, memakai video Facebook lama, memakai thumbnail dari link internet, atau mengatur tampilan judul dan deskripsi di Google.",
    path: "/admin/episodes/new",
    target: '[data-guide="episode-advanced"]',
  },
  {
    title: "Statistik Penonton",
    body: "Setelah episode tayang, buka Analytics untuk melihat jumlah penonton, halaman yang paling sering dibuka, perangkat yang dipakai, dan dari mana penonton datang. Data ini membantu melihat episode mana yang paling diminati.",
    path: "/admin/analytics",
    target: '[data-guide="nav-analytics"]',
  },
];
