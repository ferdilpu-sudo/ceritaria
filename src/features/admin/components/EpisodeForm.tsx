"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { saveEpisodeAction } from "@/features/admin/actions/episode-actions";
import { AdminFormActions } from "@/features/admin/components/AdminFormActions";
import { AdminFormSection } from "@/features/admin/components/AdminFormSection";
import { EpisodePreviewSidebar } from "@/features/admin/components/EpisodePreviewSidebar";
import { useImageFilePreview } from "@/features/admin/hooks/useImageFilePreview";
import type { EpisodeRow, SeriesRow, VideoProvider } from "@/types/database.types";

type Values = {
  seriesId: string; episodeNumber: number; slug: string; title: string; shortSynopsis: string; recap: string;
  highlights: string; videoProvider: VideoProvider; videoUrl: string; thumbnailUrl: string; durationSeconds: string;
  isPublished: boolean; seoTitle: string; seoDescription: string; thumbnailFile: FileList;
};

const field = "mt-2 w-full min-w-0 max-w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-3 text-[var(--text)] shadow-sm placeholder:text-zinc-400 focus:border-red-300";
const label = "min-w-0 text-sm font-bold text-[var(--text)]";

export function EpisodeForm({ series, initial }: { series: SeriesRow[]; initial?: EpisodeRow }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const thumbnailPreview = useImageFilePreview();
  const { register, handleSubmit, control, formState: { errors } } = useForm<Values>({
    defaultValues: {
      seriesId: initial?.series_id ?? series[0]?.id ?? "", episodeNumber: initial?.episode_number ?? 1,
      slug: initial?.slug ?? "", title: initial?.title ?? "", shortSynopsis: initial?.short_synopsis ?? "",
      recap: initial?.recap ?? "", highlights: initial?.highlights.join("\n") ?? "",
      videoProvider: initial?.video_provider ?? "youtube", videoUrl: initial?.video_url ?? "",
      thumbnailUrl: initial?.thumbnail_url ?? "", durationSeconds: initial?.duration_seconds ? String(initial.duration_seconds) : "",
      isPublished: initial?.is_published ?? false, seoTitle: initial?.seo_title ?? "", seoDescription: initial?.seo_description ?? "",
    },
  });
  const seriesId = useWatch({ control, name: "seriesId" }) ?? "";
  const episodeNumber = useWatch({ control, name: "episodeNumber" }) ?? 1;
  const title = useWatch({ control, name: "title" }) ?? "";
  const videoProvider = useWatch({ control, name: "videoProvider" }) ?? "youtube";
  const videoUrl = useWatch({ control, name: "videoUrl" }) ?? "";
  const thumbnailUrl = useWatch({ control, name: "thumbnailUrl" }) ?? "";
  const durationSeconds = useWatch({ control, name: "durationSeconds" }) ?? "";
  const published = useWatch({ control, name: "isPublished" }) ?? false;
  const thumbnailRegister = register("thumbnailFile");
  const selectedSeriesTitle = series.find((item) => item.id === seriesId)?.title ?? "";

  const submit = handleSubmit(async (values) => {
    setSaving(true); setMessage(null);
    const form = new FormData();
    if (initial?.id) form.set("id", initial.id);
    Object.entries(values).forEach(([key, value]) => {
      if (key !== "thumbnailFile") form.set(key, typeof value === "boolean" ? String(value) : String(value ?? ""));
    });
    const file = values.thumbnailFile?.[0];
    if (file) form.set("thumbnailFile", file);
    const result = await saveEpisodeAction(form);
    setSaving(false);
    if (!result.ok) return setMessage(result.message);
    router.push(result.redirectTo); router.refresh();
  });

  return (
    <form onSubmit={submit} className="min-w-0 space-y-6 pb-4">
      {message && <p role="alert" className="max-w-full break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{message}</p>}

      <div className="grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <AdminFormSection guideId="episode-info" title="Informasi Episode" description="Tentukan series, urutan episode, judul, dan ringkasan yang tampil ke penonton.">
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <label className={label}>Series<select className={field} {...register("seriesId", { required: true })}>{series.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
              <label className={label}>Nomor episode<input type="number" min="1" className={field} {...register("episodeNumber", { required: true, valueAsNumber: true, min: 1 })} /></label>
              <label className={label}>Judul<input className={field} {...register("title", { required: "Judul wajib diisi", maxLength: 200 })} />{errors.title && <small className="mt-1 block text-red-600">{errors.title.message}</small>}</label>
              <label className={label}>Slug<input className={field} placeholder="episode-1" {...register("slug", { required: true, pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ })} /><small className="mt-1 block font-normal text-[var(--muted)]">Huruf kecil, angka, dan tanda minus.</small></label>
              <label className={`${label} sm:col-span-2`}>Sinopsis singkat<textarea rows={3} className={field} {...register("shortSynopsis", { maxLength: 320 })} /></label>
            </div>
          </AdminFormSection>

          <AdminFormSection guideId="episode-media" title="Video & Media" description="YouTube menjadi sumber utama. Sidebar kanan menampilkan preview sebelum data disimpan.">
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <label className={label}>Video source<select className={field} {...register("videoProvider")}><option value="youtube">YouTube</option><option value="facebook">Facebook (legacy)</option></select></label>
              <label className={label}>Durasi (detik)<input type="number" min="1" className={field} placeholder="600" {...register("durationSeconds")} /></label>
              <label className={`${label} sm:col-span-2`}>{videoProvider === "youtube" ? "URL YouTube" : "Permalink Facebook Public"}<input type="url" className={field} placeholder={videoProvider === "youtube" ? "https://youtu.be/..." : "https://www.facebook.com/.../videos/..."} {...register("videoUrl", { required: true })} />{errors.videoUrl && <small className="mt-1 block text-red-600">{errors.videoUrl.message}</small>}</label>
              <label className={label}>Upload thumbnail<input type="file" accept="image/jpeg,image/png,image/webp" className={field} {...thumbnailRegister} onChange={(event) => { void thumbnailRegister.onChange(event); thumbnailPreview.readFile(event.target.files?.[0]); }} /></label>
              <label className={label}>Thumbnail URL opsional<input type="url" className={field} placeholder="https://..." {...register("thumbnailUrl")} /></label>
            </div>
          </AdminFormSection>

          <AdminFormSection guideId="episode-editorial" title="Editorial" description="Recap dan momen penting membantu penonton mengikuti cerita dari episode ke episode.">
            <div className="grid min-w-0 gap-5">
              <label className={label}>Recap<textarea rows={8} className={field} {...register("recap", { maxLength: 20000 })} /></label>
              <label className={label}>Momen penting<textarea rows={5} className={field} placeholder={"Jejak kaki baru\nPencarian di garis pantai\nSiluet terlihat dari kejauhan"} {...register("highlights", { maxLength: 4000 })} /><small className="mt-1 block font-normal text-[var(--muted)]">Satu momen per baris.</small></label>
            </div>
          </AdminFormSection>

          <AdminFormSection guideId="episode-publish" title="Publikasi & SEO" description="Simpan sebagai draft selama pengecekan, lalu aktifkan Published saat siap tayang.">
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <label className="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 font-bold text-[var(--text)] sm:col-span-2"><input type="checkbox" className="h-4 w-4 shrink-0 accent-red-600" {...register("isPublished")} /><span className="min-w-0 break-words">Published</span></label>
              <label className={label}>SEO title<input className={field} {...register("seoTitle", { maxLength: 200 })} /></label>
              <label className={label}>SEO description<textarea rows={3} className={field} {...register("seoDescription", { maxLength: 320 })} /></label>
            </div>
          </AdminFormSection>
        </div>

        <EpisodePreviewSidebar provider={videoProvider} videoUrl={videoUrl} thumbnailSrc={thumbnailPreview.previewUrl || thumbnailUrl || null} title={title} episodeNumber={episodeNumber} seriesTitle={selectedSeriesTitle} durationSeconds={durationSeconds} published={published} />
      </div>

      <AdminFormActions cancelHref="/admin/episodes" saving={saving} disabled={series.length === 0} published={published} submitLabel={initial ? "Simpan Perubahan" : "Buat Episode"} />
    </form>
  );
}
