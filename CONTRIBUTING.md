# Contributing

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Sebelum membuat pull request:

```bash
npm run typecheck
npm run lint
npm test
```

Jalankan `npm run build` dengan environment Supabase yang valid sebelum release/deployment.

## Code rules

- Jaga file sekitar 150–200 baris; pecah berdasarkan tanggung jawab bila membesar.
- Server Component sebagai default; gunakan `"use client"` hanya bila dibutuhkan.
- Jangan hardcode mock content di UI. Demo content harus berupa seed/database row yang tetap editable dari admin.
- Jangan menambahkan service-role secret ke client.
- Perbaiki bug di source file yang benar, bukan dengan menumpuk file `*-fix`, `*-patch`, atau override sementara.
- Tambahkan test untuk parser/validation/logic yang berubah.
- Pertahankan accessibility: label form, focus state, alt text, dan target tap yang cukup.

## Commit

Gunakan commit kecil dan deskriptif, misalnya:

```text
feat: add series hero fallback
fix: validate episode provider by URL
chore: refresh Ceritaria PWA icons
```
