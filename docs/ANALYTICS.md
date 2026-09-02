# First-party analytics

Ceritaria memiliki analytics internal berbasis Supabase untuk dashboard admin. GA4 tetap opsional dan berjalan terpisah.

## Data yang dicatat

`analytics_events` menyimpan event anonim:

- UUID visitor anonim dari `localStorage`.
- UUID session dari `sessionStorage`.
- nama event dan path publik tanpa query string.
- hostname referrer saja, bukan URL penuh.
- kategori device (`mobile`, `tablet`, `desktop`).
- metadata event terbatas maksimal 2 KB.
- timestamp.

Ceritaria tidak menyimpan alamat IP atau user-agent lengkap di tabel analytics.

## Realtime

Visitor online menggunakan Supabase Realtime Presence pada channel `ceritaria-public-visitors`. Presence memakai UUID session sementara sebagai key. Dashboard admin memperbarui angka online ketika presence join/leave/sync berubah.

Realtime adalah perkiraan sesi browser aktif, bukan identitas manusia yang terverifikasi. Banyak tab atau browser berbeda dapat dihitung sebagai sesi terpisah.

## Admin

`/admin` menampilkan ringkasan traffic dan visitor online. `/admin/analytics` menyediakan:

- visitor online realtime;
- pageview dan visitor hari ini;
- pageview, visitor, dan session 7/30/90 hari;
- grafik pageview 24 jam;
- halaman teratas;
- device;
- referrer;
- event interaksi player.

## Database

Jalankan `supabase/migrations/004_first_party_analytics.sql`. Public client tidak diberi akses `SELECT` atau `INSERT` langsung ke tabel analytics. Penulisan hanya melalui RPC tervalidasi `track_analytics_event`; laporan hanya dapat dipanggil admin authenticated melalui `get_analytics_dashboard`.

Jika retention diperlukan, hapus data lama secara terjadwal sesuai kebijakan privasi sebelum production launch.
