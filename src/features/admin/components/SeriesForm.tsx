"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { saveSeriesAction } from "@/features/admin/actions/series-actions";
import { AdminAdvancedSection } from "@/features/admin/components/AdminAdvancedSection";
import { AdminFilePicker } from "@/features/admin/components/AdminFilePicker";
import { AdminFormActions } from "@/features/admin/components/AdminFormActions";
import { AdminFormSection } from "@/features/admin/components/AdminFormSection";
import { SeriesPreviewSidebar } from "@/features/admin/components/SeriesPreviewSidebar";
import { useImageFilePreview } from "@/features/admin/hooks/useImageFilePreview";
import { useUnsavedChangesGuard } from "@/features/admin/hooks/useUnsavedChangesGuard";
import { applyServerFieldErrors } from "@/features/admin/utils/apply-server-field-errors";
import { slugifyAdminTitle } from "@/features/admin/utils/slug";
import type { SeriesRow } from "@/types/database.types";

type Values = {
  slug: string; title: string; shortSynopsis: string; synopsis: string; genres: string;
  coverUrl: string; heroUrl: string; seoTitle: string; seoDescription: string;
  isFeatured: boolean; isPublished: boolean; coverFile: FileList; heroFile: FileList;
};

const field = "mt-2 w-full min-w-0 max-w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-3 text-[var(--text)] shadow-sm placeholder:text-zinc-400 focus:border-red-300";
const label = "min-w-0 text-sm font-bold text-[var(--text)]";
const optional = <span className="font-normal text-[var(--muted)]"> (opsional)</span>;

export function SeriesForm({ initial }: { initial?: SeriesRow }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(Boolean(initial));
  const coverPreview = useImageFilePreview();
  const heroPreview = useImageFilePreview();
  const { register, handleSubmit, control, setValue, setError, clearErrors, formState: { errors, isDirty } } = useForm<Values>({
    defaultValues: {
      slug: initial?.slug ?? "", title: initial?.title ?? "", shortSynopsis: initial?.short_synopsis ?? "",
      synopsis: initial?.synopsis ?? "", genres: initial?.genres.join(", ") ?? "", coverUrl: initial?.cover_url ?? "",
      heroUrl: initial?.hero_url ?? "", seoTitle: initial?.seo_title ?? "", seoDescription: initial?.seo_description ?? "",
      isFeatured: initial?.is_featured ?? false, isPublished: initial?.is_published ?? false,
    },
  });
  const title = useWatch({ control, name: "title" }) ?? "";
  const slug = useWatch({ control, name: "slug" }) ?? "";
  const genres = useWatch({ control, name: "genres" }) ?? "";
  const coverUrl = useWatch({ control, name: "coverUrl" }) ?? "";
  const heroUrl = useWatch({ control, name: "heroUrl" }) ?? "";
  const featured = useWatch({ control, name: "isFeatured" }) ?? false;
  const published = useWatch({ control, name: "isPublished" }) ?? false;
  const coverRegister = register("coverFile");
  const heroRegister = register("heroFile");
  const slugRegister = register("slug", { required: "Alamat halaman wajib tersedia", pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ });

  useUnsavedChangesGuard(isDirty && !saving);
  useEffect(() => {
    if (!initial && !slugManual) setValue("slug", slugifyAdminTitle(title), { shouldDirty: Boolean(title) });
  }, [initial, setValue, slugManual, title]);

  const submit = handleSubmit(async (values) => {
    setSaving(true); setMessage(null); clearErrors();
    const form = new FormData();
    if (initial?.id) form.set("id", initial.id);
    Object.entries(values).forEach(([key, value]) => {
      if (key !== "coverFile" && key !== "heroFile") form.set(key, typeof value === "boolean" ? String(value) : String(value ?? ""));
    });
    if (values.coverFile?.[0]) form.set("coverFile", values.coverFile[0]);
    if (values.heroFile?.[0]) form.set("heroFile", values.heroFile[0]);
    const result = await saveSeriesAction(form);
    setSaving(false);
    if (!result.ok) {
      applyServerFieldErrors(setError, result.fieldErrors);
      setMessage(result.message);
      return;
    }
    router.push(result.redirectTo); router.refresh();
  });

  return (
    <form onSubmit={submit} className="min-w-0 space-y-5 pb-4">
      {message && <p role="alert" className="max-w-full break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{message}</p>}
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="min-w-0 space-y-5">
          <AdminFormSection guideId="series-info" title="Informasi Series" description="Tulis nama series dan informasi singkat yang akan dibaca penonton. Alamat halamannya akan dibuat otomatis.">
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <label className={`${label} sm:col-span-2`}>Judul Series <span className="text-red-600">*</span><input className={field} placeholder="Contoh: Ana & Max" {...register("title", { required: "Judul wajib diisi", maxLength: 200 })} />{errors.title && <small className="mt-1 block text-red-600">{errors.title.message}</small>}<small className="mt-1 block font-normal text-[var(--muted)]">Alamat halaman akan dibuat otomatis dari judul.</small></label>
              <label className={`${label} sm:col-span-2`}>Ringkasan singkat{optional}<textarea rows={2} className={field} placeholder="Ceritakan inti series ini dalam satu atau dua kalimat." {...register("shortSynopsis", { maxLength: 320 })} /></label>
              <label className={`${label} sm:col-span-2`}>Sinopsis lengkap{optional}<textarea rows={5} className={field} placeholder="Tuliskan cerita atau premis series dengan lebih lengkap." {...register("synopsis", { maxLength: 8000 })} /></label>
              <label className={`${label} sm:col-span-2`}>Genre{optional}<input className={field} placeholder="Drama, Survival, Romance" {...register("genres")} /><small className="mt-1 block font-normal text-[var(--muted)]">Kalau lebih dari satu, pisahkan dengan koma.</small></label>
            </div>
          </AdminFormSection>

          <AdminFormSection guideId="series-media" title="Cover & Gambar Utama" description="Pilih cover untuk daftar series dan gambar melebar untuk bagian utama halaman series.">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <AdminFilePicker label="Cover Series" hint="Disarankan poster 2:3 · JPG/PNG/WebP · maks. 5 MB" registerProps={coverRegister} onFile={coverPreview.readFile} previewSrc={coverPreview.previewUrl || coverUrl || null} />
              <AdminFilePicker label="Gambar Utama" hint="Disarankan landscape 16:9 · JPG/PNG/WebP · maks. 5 MB" registerProps={heroRegister} onFile={heroPreview.readFile} previewSrc={heroPreview.previewUrl || heroUrl || null} />
            </div>
          </AdminFormSection>

          <AdminFormSection guideId="series-publish" title="Tayangkan Series" description="Kalau series masih ingin diperiksa, jangan tampilkan dulu. Kamu juga bisa memilih series yang ingin lebih ditonjolkan di beranda.">
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <label className="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 font-bold text-[var(--text)]"><input type="checkbox" className="h-5 w-5 shrink-0 accent-red-600" {...register("isFeatured")} /><span className="min-w-0 break-words">Tampilkan sebagai series unggulan</span></label>
              <label className="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 font-bold text-[var(--text)]"><input type="checkbox" className="h-5 w-5 shrink-0 accent-red-600" {...register("isPublished")} /><span className="min-w-0 break-words">Tampilkan ke penonton</span></label>
            </div>
          </AdminFormSection>

          <AdminAdvancedSection guideId="series-advanced" title="Pengaturan Tambahan" description="Biasanya tidak perlu diubah. Buka hanya jika ingin mengganti alamat halaman, memakai gambar dari link internet, atau mengatur tampilan di Google." defaultOpen={Boolean(errors.slug || initial?.seo_title || initial?.seo_description)}>
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <label className={`${label} sm:col-span-2`}>Alamat halaman<input className={field} {...slugRegister} onChange={(event) => { void slugRegister.onChange(event); setSlugManual(true); }} />{errors.slug && <small className="mt-1 block text-red-600">{errors.slug.message}</small>}<small className="mt-1 block font-normal text-[var(--muted)]">Sudah dibuat otomatis. Sebaiknya jangan diubah jika tidak perlu.</small></label>
              <label className={label}>Link cover{optional}<input type="url" className={field} placeholder="https://..." {...register("coverUrl")} /><small className="mt-1 block font-normal text-[var(--muted)]">Kosongkan jika cover sudah diunggah dari perangkat.</small></label>
              <label className={label}>Link gambar utama{optional}<input type="url" className={field} placeholder="https://..." {...register("heroUrl")} /><small className="mt-1 block font-normal text-[var(--muted)]">Kosongkan jika gambar sudah diunggah dari perangkat.</small></label>
              <label className={label}>Judul untuk Google{optional}<input className={field} placeholder="Jika kosong, judul series akan digunakan." {...register("seoTitle", { maxLength: 200 })} /></label>
              <label className={label}>Deskripsi untuk Google{optional}<textarea rows={3} className={field} placeholder="Ringkasan yang ingin ditampilkan di hasil pencarian." {...register("seoDescription", { maxLength: 320 })} /></label>
            </div>
          </AdminAdvancedSection>
        </div>
        <SeriesPreviewSidebar title={title} slug={slug} genres={genres} coverSrc={coverPreview.previewUrl || coverUrl || null} heroSrc={heroPreview.previewUrl || heroUrl || null} published={published} featured={featured} />
      </div>
      <AdminFormActions cancelHref="/admin/series" saving={saving} published={published} submitLabel={initial ? "Simpan Perubahan" : "Buat Series"} />
    </form>
  );
}
