-- Ceritaria demo seed for development/staging only.
-- Data lives in Supabase after this seed runs and is fully editable from /admin.
-- Re-running does not overwrite edits because existing demo UUIDs are skipped.

begin;

insert into public.series (
  id, slug, title, short_synopsis, synopsis, genres, cover_url, hero_url,
  is_featured, is_published, published_at, seo_title, seo_description
) values
(
  'd0000000-0000-4000-8000-000000000001', 'demo-pulau-terakhir', '[DEMO] Pulau Terakhir',
  'Dua penyintas terdampar di pulau tropis dan harus bekerja sama untuk menemukan jalan pulang.',
  'Setelah sebuah kecelakaan memisahkan mereka dari dunia luar, Ana dan Max bertahan hidup di sebuah pulau tropis. Mereka membangun tempat berlindung, mencari makanan, membaca tanda-tanda alam, dan perlahan menemukan bahwa tantangan terbesar bukan hanya pulau itu sendiri.',
  array['Drama','Survival','Romance'], null, null, true, true, now() - interval '3 days',
  '[DEMO] Pulau Terakhir | CERITARIA',
  'Mini series drama survival tentang dua penyintas yang berusaha pulang dari sebuah pulau tropis.'
),
(
  'd0000000-0000-4000-8000-000000000002', 'demo-kota-setelah-hujan', '[DEMO] Kota Setelah Hujan',
  'Pertemuan tak sengaja setelah hujan membuka kembali cerita yang belum benar-benar selesai.',
  'Sebuah drama urban tentang dua orang yang bertemu kembali setelah bertahun-tahun. Kota berubah, hidup mereka berubah, tetapi beberapa pertanyaan lama tetap menunggu jawaban.',
  array['Drama','Romance'], null, null, false, true, now() - interval '2 days',
  '[DEMO] Kota Setelah Hujan | CERITARIA',
  'Drama romantis urban tentang pertemuan kembali, pilihan hidup, dan cerita yang belum selesai.'
),
(
  'd0000000-0000-4000-8000-000000000003', 'demo-proyek-rahasia', '[DEMO DRAFT] Proyek Rahasia',
  'Series draft untuk memastikan konten yang belum dipublikasikan hanya terlihat di admin.',
  'Data ini sengaja berstatus draft. Gunakan untuk menguji edit, publish, unpublish, upload media, dan soft delete dari dashboard admin.',
  array['Mystery','Drama'], null, null, false, false, null,
  '[DEMO DRAFT] Proyek Rahasia | CERITARIA', 'Konten pengujian internal CERITARIA.'
)
on conflict (id) do nothing;

-- The public Facebook permalink below is only a player-integration placeholder.
-- Replace it from Admin > Episodes with your own public Facebook permalink before production.
insert into public.episodes (
  id, series_id, episode_number, slug, title, short_synopsis, recap, highlights,
  video_provider, video_url, thumbnail_url, duration_seconds, is_published,
  published_at, seo_title, seo_description
) values
(
  'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 1,
  'terdampar', 'Episode 1 - Terdampar',
  'Ana terbangun di pantai asing tanpa tahu apakah ada penyintas lain.',
  'Ana sadar di tepi pantai setelah kecelakaan. Dengan bekal terbatas, ia mulai memeriksa keadaan sekitar dan mencari tanda-tanda kehidupan.',
  array['Ana terbangun di pantai','Mencari persediaan yang tersisa','Jejak pertama ditemukan'],
  'facebook', 'https://www.facebook.com/facebook/videos/prime-time-hack-the-birth-of-facebook-video/238358730483/', null, 78,
  true, now() - interval '3 days', '[DEMO] Terdampar - Pulau Terakhir | CERITARIA',
  'Episode pembuka Pulau Terakhir: Ana terbangun di pantai dan mulai mencari penyintas.'
),
(
  'e0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 2,
  'jejak-di-pasir', 'Episode 2 - Jejak di Pasir',
  'Jejak kaki membawa Ana lebih jauh menyusuri garis pantai.',
  'Setelah menemukan jejak yang masih baru, Ana memutuskan mengikutinya. Harapan bertemu penyintas lain bercampur dengan ketakutan tentang siapa yang meninggalkan jejak tersebut.',
  array['Jejak kaki baru','Pencarian di garis pantai','Siluet terlihat dari kejauhan'],
  'facebook', 'https://www.facebook.com/facebook/videos/prime-time-hack-the-birth-of-facebook-video/238358730483/', null, 84,
  true, now() - interval '2 days 12 hours', '[DEMO] Jejak di Pasir - Pulau Terakhir | CERITARIA',
  'Ana mengikuti jejak kaki misterius di pantai dalam episode kedua Pulau Terakhir.'
),
(
  'e0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 3,
  'orang-asing', 'Episode 3 - Orang Asing',
  'Ana akhirnya bertemu Max, tetapi keduanya belum yakin bisa saling percaya.',
  'Jejak itu berakhir pada pertemuan dengan Max. Mereka sama-sama selamat, sama-sama lelah, dan sama-sama membutuhkan bantuan. Kerja sama dimulai dengan hati-hati.',
  array['Ana bertemu Max','Ketegangan pertemuan pertama','Mereka sepakat bekerja sama'],
  'facebook', 'https://www.facebook.com/facebook/videos/prime-time-hack-the-birth-of-facebook-video/238358730483/', null, 91,
  true, now() - interval '1 day 18 hours', '[DEMO] Orang Asing - Pulau Terakhir | CERITARIA',
  'Ana bertemu Max untuk pertama kalinya dan keduanya mulai bekerja sama untuk bertahan hidup.'
),
(
  'e0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', 4,
  'malam-pertama', 'Episode 4 - Malam Pertama [DRAFT]',
  'Episode draft untuk menguji bahwa episode belum publish tidak muncul di halaman publik.',
  'Ana dan Max menyiapkan tempat berlindung sebelum malam. Episode ini sengaja belum dipublikasikan agar visibility rule dapat diuji.',
  array['Membangun shelter','Menyiapkan api','Draft visibility test'],
  'facebook', 'https://www.facebook.com/facebook/videos/prime-time-hack-the-birth-of-facebook-video/238358730483/', null, 88,
  false, null, '[DEMO DRAFT] Malam Pertama | CERITARIA', 'Episode draft untuk pengujian CERITARIA.'
),
(
  'e0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000002', 1,
  'halte-terakhir', 'Episode 1 - Halte Terakhir',
  'Sebuah pertemuan tak direncanakan terjadi ketika hujan menahan dua orang di halte yang sama.',
  'Hujan deras membuat perjalanan berhenti. Di sebuah halte, dua orang yang pernah saling mengenal bertemu kembali tanpa persiapan.',
  array['Hujan deras','Pertemuan kembali','Percakapan canggung pertama'],
  'facebook', 'https://www.facebook.com/facebook/videos/prime-time-hack-the-birth-of-facebook-video/238358730483/', null, 73,
  true, now() - interval '1 day 6 hours', '[DEMO] Halte Terakhir - Kota Setelah Hujan | CERITARIA',
  'Pertemuan kembali di sebuah halte membuka drama Kota Setelah Hujan.'
),
(
  'e0000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000002', 2,
  'kopi-yang-dingin', 'Episode 2 - Kopi yang Dingin',
  'Obrolan singkat berubah menjadi percakapan tentang masa lalu yang belum selesai.',
  'Mereka berteduh di kedai kecil. Kopi menjadi dingin sementara percakapan justru semakin sulit dihindari.',
  array['Kedai kopi','Cerita lama muncul kembali','Sebuah keputusan tertunda'],
  'facebook', 'https://www.facebook.com/facebook/videos/prime-time-hack-the-birth-of-facebook-video/238358730483/', null, 82,
  true, now() - interval '12 hours', '[DEMO] Kopi yang Dingin - Kota Setelah Hujan | CERITARIA',
  'Percakapan tentang masa lalu menjadi inti episode kedua Kota Setelah Hujan.'
),
(
  'e0000000-0000-4000-8000-000000000007', 'd0000000-0000-4000-8000-000000000003', 1,
  'file-pertama', 'Episode 1 - File Pertama [DRAFT]',
  'Episode admin-only untuk menguji series dan episode draft.',
  'Episode ini tidak boleh terlihat dari halaman publik selama series dan episode masih berstatus draft.',
  array['Admin visibility test','Draft series','Draft episode'],
  'facebook', 'https://www.facebook.com/facebook/videos/prime-time-hack-the-birth-of-facebook-video/238358730483/', null, 60,
  false, null, '[DEMO DRAFT] File Pertama | CERITARIA', 'Konten episode draft untuk pengujian internal CERITARIA.'
)
on conflict (id) do nothing;

commit;

select s.title, s.is_featured, s.is_published, count(e.id) as total_episodes,
  count(e.id) filter (where e.is_published = true) as published_episodes
from public.series s
left join public.episodes e on e.series_id = s.id and e.deleted_at is null
where s.id in (
  'd0000000-0000-4000-8000-000000000001',
  'd0000000-0000-4000-8000-000000000002',
  'd0000000-0000-4000-8000-000000000003'
)
group by s.id, s.title, s.is_featured, s.is_published
order by s.title;
