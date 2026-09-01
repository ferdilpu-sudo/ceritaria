# Release checklist

Sebelum push/release production:

- [ ] Jalankan `npm install` dan commit `package-lock.json` yang dihasilkan npm.
- [ ] `npm audit --omit=dev` bersih dari vulnerability production.
- [ ] `npm run typecheck` lulus.
- [ ] `npm run lint` lulus.
- [ ] `npm test` lulus.
- [ ] `npm run build` lulus dengan `.env.local`/environment Supabase yang valid.
- [ ] Migration Supabase terbaru sudah diterapkan.
- [ ] Demo rows sudah dihapus atau tidak digunakan di production.
- [ ] Contact/Privacy/Terms sudah sesuai operasi nyata.
- [ ] Domain HTTPS final sudah masuk `NEXT_PUBLIC_SITE_URL`.
- [ ] PWA icon/manifest diuji setelah reinstall.
- [ ] Admin dan API tidak di-cache Cloudflare.
- [ ] Health endpoint merespons 200.

`package-lock.json` sengaja tidak dipalsukan. Jika source package belum memilikinya, buat dari npm pada workstation berinternet lalu commit sebelum deployment dengan `npm ci`.
