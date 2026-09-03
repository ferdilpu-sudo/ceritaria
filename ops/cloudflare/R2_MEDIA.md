# Cloudflare R2 untuk media Ceritaria

Gambar baru di admin diunggah langsung dari browser ke R2 memakai presigned PUT URL. Worker Ceritaria hanya memverifikasi admin dan membuat izin upload singkat, sehingga body gambar tidak melewati Server Action dan tidak disimpan di Workers KV.

## 1. Buat bucket

Buat bucket R2 bernama `ceritaria-media`.

## 2. Pasang domain publik

Pada bucket R2, aktifkan Custom Domain dan gunakan:

```text
img.ceritaria.site
```

Jangan memakai URL presigned melalui custom domain. Upload memakai endpoint S3 R2, sedangkan pembacaan gambar publik memakai `img.ceritaria.site`.

## 3. Atur CORS

Gunakan isi `ops/cloudflare/r2-cors.json` sebagai CORS policy bucket. Production hanya membutuhkan `https://ceritaria.site`; origin localhost disediakan untuk development.

## 4. Buat R2 API token

Buat token R2 yang dibatasi ke bucket `ceritaria-media` dengan izin Object Read & Write. Simpan Access Key ID dan Secret Access Key sebagai secret, jangan commit ke repository.

## 5. Tambahkan variable Worker

Tambahkan pada Cloudflare Worker Ceritaria:

```text
R2_ACCOUNT_ID=<Cloudflare Account ID>
R2_ACCESS_KEY_ID=<R2 Access Key ID>
R2_SECRET_ACCESS_KEY=<R2 Secret Access Key>
R2_BUCKET_NAME=ceritaria-media
R2_PUBLIC_BASE_URL=https://img.ceritaria.site
```

`R2_SECRET_ACCESS_KEY` wajib diperlakukan sebagai secret. `keep_vars: true` pada Wrangler mempertahankan variable yang dikelola dari dashboard.

## Alur upload

```text
Admin browser
  -> POST /api/admin/media/presign (metadata kecil)
  -> Ceritaria memverifikasi sesi admin
  -> Ceritaria mengembalikan presigned PUT URL 5 menit
  -> browser mengecilkan gambar dan mencoba WebP
  -> browser PUT file langsung ke R2
  -> URL publik R2 dikirim ke action simpan
  -> Supabase hanya menyimpan URL
```

Target optimasi browser:

- Cover series: maksimal 1200 x 1800
- Hero series: maksimal 1920 x 1080
- Thumbnail episode: maksimal 1080 x 1920
- Input tetap dibatasi 5 MB
- WebP quality sekitar 82% bila browser mendukung

Gambar lama di Supabase Storage tetap valid. Migrasi aset lama tidak diperlukan untuk mengaktifkan R2 pada upload baru.
