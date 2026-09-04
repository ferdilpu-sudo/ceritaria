# Ceritaria

Ceritaria adalah PWA mobile-first untuk katalog dan menonton mini series. Video episode menggunakan embed YouTube privacy-enhanced sebagai sumber utama, dengan dukungan Facebook untuk konten legacy. Metadata, editorial, autentikasi admin, dan media gambar dikelola melalui Supabase.

## Fitur

- Homepage dengan hero series, episode terbaru, dan katalog series.
- Detail series dengan fallback hero visual data-driven ketika artwork belum tersedia.
- Detail episode 9:16, click-to-load player, prev/next, recap, momen penting, dan episode terkait.
- Komunitas episode: akun penonton, komentar, reply satu tingkat, like, report, moderasi, reaksi cepat, serta polling/prediksi.
- YouTube-first via `youtube-nocookie.com`; Facebook tetap didukung untuk row legacy.
- Search series dan episode.
- PWA mobile dengan app bar, bottom navigation, safe-area support, manifest, dan service worker minimal.
- Admin CMS light theme untuk series/episode, live preview media, upload cover/hero/thumbnail, draft/publish, featured, SEO, moderasi komunitas, dan pengelolaan polling.
- First-party analytics: visitor realtime, pageview, visitor unik, top pages, device, referrer, dan event player.
- Supabase Auth, Postgres RLS, Storage, dan soft delete.
- SEO: metadata, canonical, OpenGraph, JSON-LD, sitemap, robots.
- Integrasi opsional Google AdSense dan GA4 melalui environment variables.
- Production deployment di Cloudflare Workers; media gambar menggunakan Cloudflare R2.

## Stack

- Next.js 16.3.3 / App Router
- React 19.2
- TypeScript strict
- Tailwind CSS 4
- Supabase Postgres, Auth, Storage, `@supabase/ssr`
- React Hook Form + Zod
- Vitest

## Quick start

Prasyarat: Node.js 20.9+ dan project Supabase.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://127.0.0.1:3000` untuk situs publik dan `/admin/login` untuk CMS.

### Database

Jalankan migration berurutan di Supabase SQL Editor:

1. `supabase/migrations/001_initial.sql`
2. `supabase/migrations/002_youtube_video_provider.sql`
3. `supabase/migrations/003_brand_ceritaria.sql`
4. `supabase/migrations/004_first_party_analytics.sql`
5. `supabase/migrations/005_soft_delete_uniqueness.sql`
6. `supabase/migrations/006_community_comments.sql`
7. `supabase/migrations/007_episode_engagement.sql`

Buat user admin lewat Supabase Authentication, lalu tambahkan UUID-nya ke `public.admin_users` menggunakan `supabase/admin-bootstrap.sql.example` sebagai template.

## Environment variables

Wajib:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

Opsional:

```env
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_ADSENSE_CLIENT_ID=
NEXT_PUBLIC_ADSENSE_SLOT_CONTENT=
NEXT_PUBLIC_GA_ID=
```

Jangan menaruh Supabase service-role key di browser atau environment `NEXT_PUBLIC_*`.

## Commands

```bash
npm run dev        # development server
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm test           # Vitest
npm run build      # production build
npm run check      # lint + typecheck + test + build
npm start          # run production build on 127.0.0.1:3000
```

## Struktur repository

```text
src/
  app/                 Next.js routes/layouts
  components/          shared UI/layout
  features/
    admin/              CMS actions, forms, previews
    analytics/          first-party analytics + realtime visitors
    community/          komentar, reaksi, polling, profil penonton
    episode/            episode player/data/components
    home/               homepage components
    series/             series data/components/fallback visual
  lib/                  Supabase, env, analytics, security
  types/                database types
supabase/
  migrations/           database migrations
ops/
  systemd/              production service templates
  cloudflare/           tunnel/cache guidance
scripts/                deployment scripts
docs/                   architecture, data model, security
public/                  PWA icons/service worker
```

## Video policy

Ceritaria menyimpan URL video, bukan menyalin file YouTube/Facebook ke server aplikasi. Episode baru default ke YouTube. Player publik menggunakan click-to-load agar halaman tidak memuat iframe pihak ketiga sebelum pengguna memilih play.

## Mock/demo data

Mock data tidak di-hardcode di React. Jika diperlukan untuk staging/development, gunakan seed SQL terpisah dan kelola hasilnya sebagai row Supabase biasa melalui admin. Jangan jalankan seed demo di production.

## Dokumentasi

- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [Analytics](docs/ANALYTICS.md)
- [Security](docs/SECURITY.md)
- [Deployment](DEPLOYMENT.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Contributing](CONTRIBUTING.md)

## License

Belum ada lisensi open-source yang ditetapkan. Hak penggunaan source mengikuti keputusan pemilik repository.