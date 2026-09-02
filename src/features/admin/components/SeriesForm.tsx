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
  const slugRegister = register("slug", { required: "Slug wajib tersedia", pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ });

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
          <AdminFormSection guideId="series-info" title="Informasi Series" description="Mulai dari isi yang benar-benar dilihat penonton. URL dibuat otomatis dari judul.">
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <label className={`${label} sm:col-span-2`}>Judul <span className="text-red-600">*</span><input className={field} placeholder="Contoh: Ana & Max" {...register("title", { required: "Judul wajib diisi", maxLength: 200 })} />{errors.title && <small className="mt-1 block text-red-600">{errors.title.message}</small>}<small className="mt-1 block font-normal text-[var(--muted)]">URL: /series/{slug || "judul-series"}</small></label>
              <label className={`${label} sm:col-span-2`}>Sinopsis singkat{optional}<textarea rows={2} className={field} placeholder="Ringkasan untuk card dan hero." {...register("shortSynopsis", { maxLength: 320 })} /></label>
              <label className={`${label} sm:col-span-2`}>Sinopsis lengkap{optional}<textarea rows={5} className={field} {...register("synopsis", { maxLength: 8000 })} /></label>
              <label className={`${label} sm:col-span-2`}>Genre{optional}<input className={field} placeholder="Drama, Survival, Romance" {...register("genres")} /><small className="mt-1 block font-normal text-[var(--muted)]">Pisahkan dengan koma.</small></label>
            </div>
          </AdminFormSection>

          <AdminFormSection guideId="series-media" title="Media" description="Upload gambar langsung. URL manual tersedia di Pengaturan Lanjutan.">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <AdminFilePicker label="Cover" hint="Poster 2:3 · JPG/PNG/WebP · maks. 5 MB" registerProps={coverRegister} onFile={coverPreview.readFile} />
              <AdminFilePicker label="Hero homepage" hint="Landscape 16:9 · JPG/PNG/WebP · maks. 5 MB" registerProps={heroRegister} onFile={heroPreview.readFile} />
            </div>
          </AdminFormSection>

          <AdminFormSection guideId="series-publish" title="Publikasi" description="Simpan draft selama pengecekan. Featured hanya untuk series yang ingin ditonjolkan.">
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <label className="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 font-bold text-[var(--text)]"><input type="checkbox" className="h-5 w-5 shrink-0 accent-red-600" {...register("isFeatured")} /><span className="min-w-0 break-words">Series unggulan</span></label>
              <label className="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 font-bold text-[var(--text)]"><input type="checkbox" className="h-5 w-5 shrink-0 accent-red-600" {...register("isPublished")} /><span className="min-w-0 break-words">Published</span></label>
            </div>
          </AdminFormSection>

          <AdminAdvancedSection guideId="series-advanced" title="SEO & Pengaturan Lanjutan" description="Edit slug, URL gambar manual, dan metadata pencarian jika diperlukan." defaultOpen={Boolean(initial?.seo_title || initial?.seo_description)}>
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <label className={`${label} sm:col-span-2`}>Slug<input className={field} {...slugRegister} onChange={(event) => { void slugRegister.onChange(event); setSlugManual(true); }} />{errors.slug && <small className="mt-1 block text-red-600">{errors.slug.message}</small>}</label>
              <label className={label}>Cover URL{optional}<input type="url" className={field} placeholder="https://..." {...register("coverUrl")} /></label>
              <label className={label}>Hero URL{optional}<input type="url" className={field} placeholder="https://..." {...register("heroUrl")} /></label>
              <label className={label}>SEO title{optional}<input className={field} {...register("seoTitle", { maxLength: 200 })} /></label>
              <label className={label}>SEO description{optional}<textarea rows={3} className={field} {...register("seoDescription", { maxLength: 320 })} /></label>
            </div>
          </AdminAdvancedSection>
        </div>
        <SeriesPreviewSidebar title={title} slug={slug} genres={genres} coverSrc={coverPreview.previewUrl || coverUrl || null} heroSrc={heroPreview.previewUrl || heroUrl || null} published={published} featured={featured} />
      </div>
      <AdminFormActions cancelHref="/admin/series" saving={saving} published={published} submitLabel={initial ? "Simpan Perubahan" : "Buat Series"} />
    </form>
  );
}
