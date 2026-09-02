"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { saveEpisodeAction } from "@/features/admin/actions/episode-actions";
import { AdminAdvancedSection } from "@/features/admin/components/AdminAdvancedSection";
import { AdminFilePicker } from "@/features/admin/components/AdminFilePicker";
import { AdminFormActions } from "@/features/admin/components/AdminFormActions";
import { AdminFormSection } from "@/features/admin/components/AdminFormSection";
import { EpisodePreviewSidebar } from "@/features/admin/components/EpisodePreviewSidebar";
import { VideoPreview } from "@/features/admin/components/VideoPreview";
import { useImageFilePreview } from "@/features/admin/hooks/useImageFilePreview";
import { useUnsavedChangesGuard } from "@/features/admin/hooks/useUnsavedChangesGuard";
import { applyServerFieldErrors } from "@/features/admin/utils/apply-server-field-errors";
import { secondsToClock } from "@/features/admin/utils/duration";
import { buildEpisodeSlug } from "@/features/admin/utils/slug";
import type { EpisodeRow, SeriesRow, VideoProvider } from "@/types/database.types";

type Values = {
  seriesId: string; episodeNumber: number; slug: string; title: string; shortSynopsis: string; recap: string;
  highlights: string; videoProvider: VideoProvider; videoUrl: string; thumbnailUrl: string; durationSeconds: string;
  isPublished: boolean; seoTitle: string; seoDescription: string; thumbnailFile: FileList;
};

interface EpisodeFormProps {
  series: SeriesRow[];
  initial?: EpisodeRow;
  nextEpisodeBySeries?: Record<string, number>;
}

const field = "mt-2 w-full min-w-0 max-w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-3 text-[var(--text)] shadow-sm placeholder:text-zinc-400 focus:border-red-300";
const label = "min-w-0 text-sm font-bold text-[var(--text)]";
const optional = <span className="font-normal text-[var(--muted)]"> (opsional)</span>;

export function EpisodeForm({ series, initial, nextEpisodeBySeries = {} }: EpisodeFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(Boolean(initial));
  const thumbnailPreview = useImageFilePreview();
  const firstSeriesId = initial?.series_id ?? series[0]?.id ?? "";
  const { register, handleSubmit, control, setValue, setError, clearErrors, formState: { errors, isDirty } } = useForm<Values>({
    defaultValues: {
      seriesId: firstSeriesId,
      episodeNumber: initial?.episode_number ?? nextEpisodeBySeries[firstSeriesId] ?? 1,
      slug: initial?.slug ?? "", title: initial?.title ?? "", shortSynopsis: initial?.short_synopsis ?? "",
      recap: initial?.recap ?? "", highlights: initial?.highlights.join("\n") ?? "",
      videoProvider: initial?.video_provider ?? "youtube", videoUrl: initial?.video_url ?? "",
      thumbnailUrl: initial?.thumbnail_url ?? "", durationSeconds: secondsToClock(initial?.duration_seconds),
      isPublished: initial?.is_published ?? false, seoTitle: initial?.seo_title ?? "", seoDescription: initial?.seo_description ?? "",
    },
  });
  const seriesId = useWatch({ control, name: "seriesId" }) ?? "";
  const episodeNumber = useWatch({ control, name: "episodeNumber" }) ?? 1;
  const title = useWatch({ control, name: "title" }) ?? "";
  const videoProvider = useWatch({ control, name: "videoProvider" }) ?? "youtube";
  const videoUrl = useWatch({ control, name: "videoUrl" }) ?? "";
  const thumbnailUrl = useWatch({ control, name: "thumbnailUrl" }) ?? "";
  const duration = useWatch({ control, name: "durationSeconds" }) ?? "";
  const published = useWatch({ control, name: "isPublished" }) ?? false;
  const thumbnailRegister = register("thumbnailFile");
  const slugRegister = register("slug", { required: "Slug wajib tersedia", pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ });
  const selectedSeriesTitle = series.find((item) => item.id === seriesId)?.title ?? "";

  useUnsavedChangesGuard(isDirty && !saving);
  useEffect(() => {
    if (!initial && seriesId) setValue("episodeNumber", nextEpisodeBySeries[seriesId] ?? 1, { shouldDirty: false });
  }, [initial, nextEpisodeBySeries, seriesId, setValue]);
  useEffect(() => {
    if (!initial && !slugManual) setValue("slug", buildEpisodeSlug(episodeNumber, title), { shouldDirty: Boolean(title) });
  }, [episodeNumber, initial, setValue, slugManual, title]);

  const submit = handleSubmit(async (values) => {
    setSaving(true); setMessage(null); clearErrors();
    const form = new FormData();
    if (initial?.id) form.set("id", initial.id);
    Object.entries(values).forEach(([key, value]) => {
      if (key !== "thumbnailFile") form.set(key, typeof value === "boolean" ? String(value) : String(value ?? ""));
    });
    if (values.thumbnailFile?.[0]) form.set("thumbnailFile", values.thumbnailFile[0]);
    const result = await saveEpisodeAction(form);
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
          <AdminFormSection guideId="episode-info" title="Informasi Episode" description="Pilih series, cek nomor episode otomatis, lalu isi judul. URL dibuat otomatis.">
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <label className={label}>Series <span className="text-red-600">*</span><select className={field} {...register("seriesId", { required: "Series wajib dipilih" })}>{series.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>{errors.seriesId && <small className="mt-1 block text-red-600">{errors.seriesId.message}</small>}</label>
              <label className={label}>Episode ke- <span className="text-red-600">*</span><input type="number" min="1" className={field} {...register("episodeNumber", { required: "Nomor episode wajib diisi", valueAsNumber: true, min: 1 })} />{errors.episodeNumber && <small className="mt-1 block text-red-600">{errors.episodeNumber.message}</small>}<small className="mt-1 block font-normal text-[var(--muted)]">Disarankan otomatis dari episode terakhir.</small></label>
              <label className={`${label} sm:col-span-2`}>Judul <span className="text-red-600">*</span><input className={field} placeholder="Contoh: Hari Pertama Ana Bekerja" {...register("title", { required: "Judul wajib diisi", maxLength: 200 })} />{errors.title && <small className="mt-1 block text-red-600">{errors.title.message}</small>}</label>
              <label className={`${label} sm:col-span-2`}>Ringkasan singkat{optional}<textarea rows={2} className={field} placeholder="Satu atau dua kalimat tentang episode ini." {...register("shortSynopsis", { maxLength: 320 })} /></label>
            </div>
          </AdminFormSection>

          <AdminFormSection guideId="episode-media" title="Video & Thumbnail" description="Tempel link YouTube, cek player, lalu pilih thumbnail. Semua ada di satu area supaya cepat diverifikasi.">
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <label className={`${label} sm:col-span-2`}>{videoProvider === "youtube" ? "URL YouTube" : "Permalink Facebook Public"} <span className="text-red-600">*</span><input type="url" className={field} placeholder={videoProvider === "youtube" ? "https://youtu.be/..." : "https://www.facebook.com/.../videos/..."} {...register("videoUrl", { required: "URL video wajib diisi" })} />{errors.videoUrl && <small className="mt-1 block text-red-600">{errors.videoUrl.message}</small>}</label>
              <div className="sm:col-span-2"><VideoPreview provider={videoProvider} videoUrl={videoUrl} /></div>
              <AdminFilePicker label="Thumbnail" hint="Poster/vertical · JPG/PNG/WebP · maks. 5 MB" registerProps={thumbnailRegister} onFile={thumbnailPreview.readFile} />
              <label className={label}>Durasi{optional}<input inputMode="numeric" className={field} placeholder="10:30" {...register("durationSeconds", { pattern: { value: /^\d{1,3}:[0-5]\d$/, message: "Gunakan format menit:detik, contoh 10:30" } })} />{errors.durationSeconds && <small className="mt-1 block text-red-600">{errors.durationSeconds.message}</small>}<small className="mt-1 block font-normal text-[var(--muted)]">Format menit:detik.</small></label>
            </div>
          </AdminFormSection>

          <AdminAdvancedSection guideId="episode-editorial" title="Recap & Momen Penting" description="Opsional. Buka bila episode perlu konteks cerita tambahan." defaultOpen={Boolean(initial?.recap || initial?.highlights.length)}>
            <div className="grid min-w-0 gap-5">
              <label className={label}>Recap{optional}<textarea rows={6} className={field} {...register("recap", { maxLength: 20000 })} /></label>
              <label className={label}>Momen penting{optional}<textarea rows={4} className={field} placeholder={"Ana datang ke studio\nManajer memanggil Ana\nAna dikeluarkan dari proyek"} {...register("highlights", { maxLength: 4000 })} /><small className="mt-1 block font-normal text-[var(--muted)]">Satu momen per baris.</small></label>
            </div>
          </AdminAdvancedSection>

          <AdminFormSection guideId="episode-publish" title="Publikasi" description="Biarkan sebagai Draft saat masih mengecek video dan thumbnail.">
            <label className="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 font-bold text-[var(--text)]"><input type="checkbox" className="h-5 w-5 shrink-0 accent-red-600" {...register("isPublished")} /><span className="min-w-0 break-words">Published</span></label>
          </AdminFormSection>

          <AdminAdvancedSection guideId="episode-advanced" title="SEO & Pengaturan Lanjutan" description="Ubah slug, sumber video legacy, URL thumbnail, atau metadata pencarian." defaultOpen={Boolean(errors.slug || errors.thumbnailUrl || initial?.video_provider === "facebook" || initial?.seo_title || initial?.seo_description)}>
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <label className={`${label} sm:col-span-2`}>Slug<input className={field} {...slugRegister} onChange={(event) => { void slugRegister.onChange(event); setSlugManual(true); }} />{errors.slug && <small className="mt-1 block text-red-600">{errors.slug.message}</small>}<small className="mt-1 block font-normal text-[var(--muted)]">URL episode dibuat otomatis. Edit hanya jika memang perlu.</small></label>
              <label className={label}>Sumber video<select className={field} {...register("videoProvider")}><option value="youtube">YouTube</option><option value="facebook">Facebook (legacy)</option></select></label>
              <label className={label}>Thumbnail URL{optional}<input type="url" className={field} placeholder="https://..." {...register("thumbnailUrl")} />{errors.thumbnailUrl && <small className="mt-1 block text-red-600">{errors.thumbnailUrl.message}</small>}</label>
              <label className={label}>SEO title{optional}<input className={field} {...register("seoTitle", { maxLength: 200 })} /></label>
              <label className={label}>SEO description{optional}<textarea rows={3} className={field} {...register("seoDescription", { maxLength: 320 })} /></label>
            </div>
          </AdminAdvancedSection>
        </div>
        <EpisodePreviewSidebar provider={videoProvider} thumbnailSrc={thumbnailPreview.previewUrl || thumbnailUrl || null} title={title} episodeNumber={episodeNumber} seriesTitle={selectedSeriesTitle} durationSeconds={duration} published={published} />
      </div>
      <AdminFormActions cancelHref="/admin/episodes" saving={saving} disabled={series.length === 0} published={published} submitLabel={initial ? "Simpan Perubahan" : "Simpan Episode"} />
    </form>
  );
}
