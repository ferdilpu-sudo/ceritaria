# Data model

Schema utama berada di `supabase/migrations`.

## admin_users

Daftar UUID user Supabase Auth yang diberi akses CMS.

- `user_id` UUID, primary key, FK ke `auth.users`.
- `created_at` timestamp.

Tidak ada public signup flow di aplikasi.

## series

Menyimpan katalog cerita.

Field penting:
- `slug`, `title`
- `short_synopsis`, `synopsis`
- `genres[]`
- `cover_url`, `hero_url`
- `is_featured`, `is_published`, `published_at`
- `seo_title`, `seo_description`
- `created_at`, `updated_at`, `deleted_at`

Soft-delete menjaga record tidak muncul publik tanpa melakukan hard delete.

## episodes

Episode terikat ke satu series.

Field penting:
- `series_id`
- `episode_number`, `slug`, `title`
- `short_synopsis`, `recap`, `highlights[]`
- `video_provider` (`youtube` atau `facebook`)
- `video_url`
- `thumbnail_url`, `duration_seconds`
- `is_published`, `published_at`
- SEO + timestamps + `deleted_at`

Nomor episode dan slug unik dalam satu series.

## Storage

Bucket public:
- `series-media`: cover dan hero image.
- `episode-media`: thumbnail episode.

Upload/update/delete hanya diizinkan untuk user yang lolos `public.is_admin()` melalui RLS policy.

## RLS

Anon/authenticated hanya dapat membaca series dan episode published yang tidak soft-deleted. User authenticated tidak otomatis menjadi admin; membership tetap diverifikasi melalui `admin_users`.

## Migrations

- `001_initial.sql`: schema, indexes, RLS, storage bucket/policies.
- `002_youtube_video_provider.sql`: YouTube-first + Facebook legacy.
- `003_brand_ceritaria.sql`: migrasi SEO data dari brand lama ke Ceritaria.

Jangan mengubah migration yang sudah diterapkan pada environment production. Tambahkan migration baru untuk perubahan schema berikutnya.
