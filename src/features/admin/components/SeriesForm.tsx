"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { saveSeriesAction } from "@/features/admin/actions/series-actions";
import { AdminFormActions } from "@/features/admin/components/AdminFormActions";
import { AdminFormSection } from "@/features/admin/components/AdminFormSection";
import { SeriesPreviewSidebar } from "@/features/admin/components/SeriesPreviewSidebar";
import { useImageFilePreview } from "@/features/admin/hooks/useImageFilePreview";
import type { SeriesRow } from "@/types/database.types";

type Values = {
  slug: string; title: string; shortSynopsis: string; synopsis: string; genres: string;
  coverUrl: string; heroUrl: string; seoTitle: string; seoDescription: string;
  isFeatured: boolean; isPublished: boolean; coverFile: FileList; heroFile: FileList;
};

const field = "mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-3 text-[var(--text)] shadow-sm placeholder:text-zinc-400 focus:border-red-300";
const label = "text-sm font-bold text-[var(--text)]";

export function SeriesForm({ initial }: { initial?: SeriesRow }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const coverPreview = useImageFilePreview();
  const heroPreview = useImageFilePreview();
  const { register, handleSubmit, control, formState: { errors } } = useForm<Values>({
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

  const submit = handleSubmit(async (values) => {
    setSaving(true); setMessage(null);
    const form = new FormData();
    if (initial?.id) form.set("id", initial.id);
    Object.entries(values).forEach(([key, value]) => {
      if (key !== "coverFile" && key !== "heroFile") form.set(key, typeof value === "boolean" ? String(value) : String(value ?? ""));
    });
    const coverFile = values.coverFile?.[0];
    const heroFile = values.heroFile?.[0];
    if (coverFile) form.set("coverFile", coverFile);
    if (heroFile) form.set("heroFile", heroFile);
    const result = await saveSeriesAction(form);
    setSaving(false);
    if (!result.ok) return setMessage(result.message);
    router.push(result.redirectTo); router.refresh();
  });

  return (
    <form onSubmit={submit} className="space-y-6 pb-4">
      {message && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{message}</p>}

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="space-y-6">
          <AdminFormSection title="Informasi Series" description="Identitas utama series yang akan dilihat penonton di katalog CERITARIA.">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={label}>Judul<input className={field} {...register("title", { required: "Judul wajib diisi", maxLength: 200 })} />{errors.title && <small className="mt-1 block text-red-600">{errors.title.message}</small>}</label>
              <label className={label}>Slug<input className={field} placeholder="ana-dan-max" {...register("slug", { required: true, pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ })} /><small className="mt-1 block font-normal text-[var(--muted)]">Huruf kecil, angka, dan tanda minus.</small></label>
              <label className={`${label} sm:col-span-2`}>Sinopsis singkat<textarea rows={2} className={field} placeholder="Ringkasan singkat untuk card dan hero." {...register("shortSynopsis", { maxLength: 320 })} /></label>
              <label className={`${label} sm:col-span-2`}>Sinopsis lengkap<textarea rows={6} className={field} {...register("synopsis", { maxLength: 8000 })} /></label>
              <label className={`${label} sm:col-span-2`}>Genre<input className={field} placeholder="Drama, Survival, Romance" {...register("genres")} /><small className="mt-1 block font-normal text-[var(--muted)]">Pisahkan setiap genre dengan koma.</small></label>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Media" description="Cover untuk katalog dan hero image untuk area unggulan di homepage.">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={label}>Upload cover<input type="file" accept="image/jpeg,image/png,image/webp" className={field} {...coverRegister} onChange={(event) => { void coverRegister.onChange(event); coverPreview.readFile(event.target.files?.[0]); }} /><small className="mt-1 block font-normal text-[var(--muted)]">JPG, PNG, atau WebP. Maksimal 5 MB.</small></label>
              <label className={label}>Cover URL opsional<input type="url" className={field} placeholder="https://..." {...register("coverUrl")} /></label>
              <label className={label}>Upload hero<input type="file" accept="image/jpeg,image/png,image/webp" className={field} {...heroRegister} onChange={(event) => { void heroRegister.onChange(event); heroPreview.readFile(event.target.files?.[0]); }} /><small className="mt-1 block font-normal text-[var(--muted)]">Landscape direkomendasikan. Maksimal 5 MB.</small></label>
              <label className={label}>Hero URL opsional<input type="url" className={field} placeholder="https://..." {...register("heroUrl")} /></label>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Publikasi & SEO" description="Atur visibilitas series dan metadata mesin pencari.">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex min-h-14 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 font-bold text-[var(--text)]"><input type="checkbox" className="h-4 w-4 accent-red-600" {...register("isFeatured")} /> Series unggulan</label>
              <label className="flex min-h-14 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 font-bold text-[var(--text)]"><input type="checkbox" className="h-4 w-4 accent-red-600" {...register("isPublished")} /> Published</label>
              <label className={label}>SEO title<input className={field} {...register("seoTitle", { maxLength: 200 })} /></label>
              <label className={label}>SEO description<textarea rows={3} className={field} {...register("seoDescription", { maxLength: 320 })} /></label>
            </div>
          </AdminFormSection>
        </div>

        <SeriesPreviewSidebar title={title} slug={slug} genres={genres} coverSrc={coverPreview.previewUrl || coverUrl || null} heroSrc={heroPreview.previewUrl || heroUrl || null} published={published} featured={featured} />
      </div>

      <AdminFormActions cancelHref="/admin/series" saving={saving} published={published} submitLabel={initial ? "Simpan Perubahan" : "Buat Series"} />
    </form>
  );
}
