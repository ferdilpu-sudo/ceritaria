# Architecture

## Overview

Ceritaria memisahkan aplikasi web, data, media gambar, dan video agar origin VM mudah diganti tanpa kehilangan konten.

```text
Browser / Installed PWA
        |
        v
Cloudflare Tunnel
        |
        v
Next.js on Oracle VM
   |             |
   |             +--> YouTube / Facebook embed
   v
Supabase
(Postgres + Auth + Storage)
```

## Frontend

Next.js App Router memakai Server Component sebagai default. Client Component dibatasi pada interaksi yang membutuhkan state/browser API, misalnya form admin, preview video, player click-to-load, dan bottom navigation active state.

Public routes berada di `src/app/(public)`. Admin routes berada di `src/app/(admin)` dan dilindungi pengecekan session + membership `admin_users`.

## Feature boundaries

- `features/series`: query public, card, hero, fallback visual.
- `features/episode`: query public, URL parser, provider player, navigation.
- `features/home`: presentation khusus homepage.
- `features/admin`: actions, validation, CMS form, media preview/upload.

Business/data access tidak ditempatkan langsung di presentational component jika sudah memiliki service/action yang sesuai.

## Video provider

Episode menyimpan `video_provider` dan `video_url`. YouTube adalah default baru, Facebook dipertahankan untuk data legacy. Render publik juga memvalidasi URL aktual sehingga provider lama yang tidak sinkron tidak membuat halaman crash.

YouTube menggunakan `youtube-nocookie.com` dan click-to-load. Ceritaria tidak download, extract, atau proxy file video provider.

## Caching

Public query menggunakan revalidation Next.js. Admin dan API menggunakan no-store/private headers. Service worker hanya menangani aset same-origin yang aman dan tidak meng-cache admin, API, embed pihak ketiga, analytics, atau ads.

## PWA

Mobile public UI menggunakan app bar, bottom navigation, safe-area CSS, standalone manifest, dan icon Ceritaria. Desktop tetap memakai navigasi web responsif. Admin sengaja memakai light theme untuk workflow operasional siang hari.

## Deployment boundaries

Oracle VM hanya menjalankan application process. Supabase adalah source-of-truth untuk data dan gambar. Video tetap berada di provider video. Cloudflare Tunnel menghindari kebutuhan mengekspos port web VM secara langsung.
