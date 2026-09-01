# Cloudflare untuk Ceritaria

## Tunnel

1. Tambahkan domain ke Cloudflare.
2. Buat named tunnel, misalnya `ceritaria-production`.
3. Install `cloudflared` pada Oracle VM.
4. Arahkan published hostname ke `http://127.0.0.1:3000`.
5. Redirect `www` ke hostname canonical bila diperlukan.
6. Jangan membuka port 80/443 pada VM hanya untuk aplikasi bila seluruh traffic web masuk lewat Tunnel.

## Cache rules

- `/_next/static/*`: hormati immutable cache header origin.
- `/admin/*`: bypass cache.
- `/api/*`: bypass cache.
- Auth/callback/preview: bypass bila ditambahkan.
- Response dengan session cookie: bypass.
- Public HTML: hormati `Cache-Control` Next.js.
- Jangan gunakan global `Cache Everything`.

## Security

- Cloudflare Tunnel menjadi ingress; aplikasi tetap bind ke loopback.
- DDoS protection bawaan Cloudflare tetap aktif.
- Tambahkan rate rule pada login admin hanya jika ada abuse nyata.
- Jangan memakai Cloudflare untuk proxy/download file video YouTube/Facebook.
