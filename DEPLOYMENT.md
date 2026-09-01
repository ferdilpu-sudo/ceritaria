# Deployment Ceritaria

Target produksi: Next.js di Oracle Cloud VM, Supabase sebagai data layer, dan Cloudflare Tunnel sebagai ingress.

## 1. Oracle VM

Gunakan Ubuntu LTS dengan Node.js yang memenuhi `>=20.9.0`. VM diperlakukan disposable: database, gambar, dan video bukan source-of-truth di disk VM.

Baseline:
- SSH key only.
- Nonaktifkan password/root SSH.
- Batasi inbound firewall. Port aplikasi tidak perlu diekspos publik jika memakai Tunnel.
- Simpan secret di `/etc/ceritaria`, bukan repository.

## 2. User dan direktori

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin ceritaria
sudo mkdir -p /opt/ceritaria /etc/ceritaria
sudo chown -R ceritaria:ceritaria /opt/ceritaria
sudo chmod 750 /etc/ceritaria
```

Clone repository ke `/opt/ceritaria/current`.

## 3. Environment

Buat `/etc/ceritaria/ceritaria.env` dari `.env.example`, lalu isi value production.

```bash
sudo chown root:ceritaria /etc/ceritaria/ceritaria.env
sudo chmod 640 /etc/ceritaria/ceritaria.env
```

`NEXT_PUBLIC_SITE_URL` harus memakai domain HTTPS production.

## 4. Build pertama

```bash
cd /opt/ceritaria/current
npm ci --no-audit --no-fund
npm run lint
npm run typecheck
npm run test
npm run build
```

## 5. systemd

```bash
sudo cp ops/systemd/ceritaria.service /etc/systemd/system/ceritaria.service
sudo systemctl daemon-reload
sudo systemctl enable --now ceritaria
sudo systemctl status ceritaria
curl http://127.0.0.1:3000/api/health
```

Aplikasi bind ke `127.0.0.1:3000`.

## 6. Cloudflare Tunnel

Buat named tunnel, lalu arahkan hostname Ceritaria ke:

```text
http://127.0.0.1:3000
```

Gunakan service installer resmi Cloudflare atau template `ops/systemd/cloudflared.service.example`. Jika memakai template, simpan token di `/etc/ceritaria/cloudflared.env`.

Cache guidance ada di `ops/cloudflare/README.md`.

## 7. Deploy update

```bash
APP_DIR=/opt/ceritaria/current ./scripts/deploy.sh
```

Script menjalankan `git pull`, `npm ci`, lint, typecheck, test, build, restart service, lalu health check. Service tidak direstart jika validation/build gagal.

## 8. Go-live checklist

- Semua migration Supabase sudah diterapkan.
- Admin login berfungsi dan public signup tidak dibutuhkan/ditutup sesuai konfigurasi.
- `NEXT_PUBLIC_SITE_URL` memakai domain final.
- Privacy, Terms, Contact sudah sesuai operasi nyata.
- AdSense/GA env hanya diaktifkan jika account/configuration sudah siap.
- Cloudflare cache bypass untuk `/admin/*` dan `/api/*`.
- Episode YouTube memiliki embedding yang diizinkan.
- `npm run check` lulus pada environment production.
- `/api/health` mengembalikan 200.

## 9. Disaster recovery

Jika VM hilang: provision VM baru, clone repository, restore environment/tunnel secret, `npm ci && npm run build`, install systemd unit, start service dan tunnel. Supabase tetap menyimpan database dan gambar; provider video tetap menyimpan video episode.
