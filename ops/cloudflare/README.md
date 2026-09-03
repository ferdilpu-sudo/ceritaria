# Cloudflare untuk Ceritaria

Ceritaria saat ini berjalan di Cloudflare Workers melalui Vinext. Konfigurasi media gambar baru menggunakan Cloudflare R2 dan dijelaskan di [`R2_MEDIA.md`](./R2_MEDIA.md).

## Media R2

- Bucket yang disarankan: `ceritaria-media`.
- Domain publik yang disarankan: `img.ceritaria.site`.
- Browser mengunggah langsung ke R2 dengan presigned PUT URL.
- Worker hanya memverifikasi admin dan membuat URL upload singkat, sehingga body gambar tidak melewati Worker.
- Supabase tetap menjadi database dan autentikasi; URL gambar disimpan di Postgres.
- Workers KV hanya dipakai Vinext untuk cache aplikasi, bukan penyimpanan gambar.

## Cache rules

- `/_next/static/*`: hormati immutable cache header origin.
- `/admin/*`: bypass cache.
- `/api/*`: bypass cache.
- Auth/callback/preview: bypass bila ditambahkan.
- Response dengan session cookie: bypass.
- Public HTML: hormati `Cache-Control` Next.js.
- Jangan gunakan global `Cache Everything`.

## Security

- Jangan commit credential R2 atau secret Supabase.
- Token R2 untuk media sebaiknya dibatasi hanya ke bucket media.
- `/api/admin/media/presign` memverifikasi user dan keanggotaan `admin_users` sebelum membuat presigned URL.
- Jangan memakai Cloudflare untuk proxy/download file video YouTube/Facebook.
