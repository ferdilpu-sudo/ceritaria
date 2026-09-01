# Security model

## Authentication and authorization

Admin login memakai Supabase Auth. Setelah session valid, aplikasi tetap memeriksa UUID user pada `public.admin_users`. Database RLS menjadi boundary otorisasi kedua di belakang aplikasi.

## Secrets

Browser hanya menerima publishable Supabase key dan environment yang memang `NEXT_PUBLIC_*`. Jangan commit `.env.local`, service-role key, token Cloudflare, private key, atau password.

## Database

- RLS aktif pada tabel utama.
- Query public hanya membaca konten published dan non-deleted.
- Admin CRUD membutuhkan membership admin.
- Soft delete digunakan untuk series/episode.

## Upload

Media admin dibatasi bucket dan MIME type gambar. Storage migration menetapkan limit 5 MB untuk JPEG/PNG/WebP.

## Third-party embeds

URL YouTube/Facebook divalidasi sebelum dibuat menjadi iframe. YouTube menggunakan privacy-enhanced host. Video pihak ketiga tidak diproxy oleh application server.

## HTTP/cache

`next.config.ts` menerapkan security/cache headers. `/admin/*` harus private/no-store/noindex dan `/api/*` no-store. Cloudflare juga harus bypass cache untuk path tersebut.

## Reporting

Jika repository menjadi public, jangan melaporkan kredensial atau exploit aktif di issue publik. Gunakan kanal privat pemilik repository untuk temuan keamanan sensitif.
