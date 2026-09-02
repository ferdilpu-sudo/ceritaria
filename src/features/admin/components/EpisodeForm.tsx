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
  const slugRegister = register("slug", { required: "Alamat halaman wajib tersedia", pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ });
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
          <AdminFormSection guideId="episode-info" title="Informasi Episode" description="Pilih series tempat episode ini berada, lalu tulis judulnya. Nomor episode berikutnya akan terisi otomatis.">
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <label className={label}>Masuk ke Series <span className="text-red-600">*</span><select className={field} {...register("seriesId", { required: "Pilih series terlebih dahulu" })}>{series.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>{errors.seriesId && <small className="mt-1 block text-red-600">{errors.seriesId.message}</small>}</label>
              <label className={label}>Episode ke- <span className="text-red-600">*</span><input type="number" min="1" className={field} {...register("episodeNumber", { required: "Nomor episode wajib diisi", valueAsNumber: true, min: 1 })} />{errors.episodeNumber && <small className="mt-1 block text-red-600">{errors.episodeNumber.message}</small>}<small className="mt-1 block font-normal text-[var(--muted)]">Sudah diisi otomatis. Ubah hanya jika urutannya memang berbeda.</small></label>
              <label className={`${label} sm:col-span-2`}>Judul Episode <span className="text-red-600">*</span><input className={field} placeholder="Contoh: Hari Pertama Ana Bekerja" {...register("title", { required: "Judul wajib diisi", maxLength: 200 })} />{errors.title && <small className="mt-1 block text-red-600">{errors.title.message}</small>}</label>
              <label className={`${label} sm:col-span-2`}>Ringkasan singkat{optional}<textarea rows={2} className={field} placeholder="Ceritakan isi episode ini dalam satu atau dua kalimat." {...register("shortSynopsis", { maxLength: 320 })} /></label>
            </div>
          </AdminFormSection>

          <AdminFormSection guideId="episode-media" title="Video & Thumbnail" description="Tempel link video yang sudah kamu upload, cek preview-nya, lalu pilih gambar thumbnail untuk episode ini.">
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <label className={`${label} sm:col-span-2`}>{videoProvider === "youtube" ? "Link Video YouTube" : "Link Video Facebook"} <span className="text-red-600">*</span><input type="url" className={field} placeholder={videoProvider === "youtube" ? "https://youtu.be/..." : "https://www.facebook.com/.../videos/..."} {...register("videoUrl", { required: "Link video wajib diisi" })} />{errors.videoUrl && <small className="mt-1 block text-red-600">{errors.videoUrl.message}</small>}</label>
              <div className="sm:col-span-2"><VideoPreview provider={videoProvider} videoUrl={videoUrl} /></div>
              <AdminFilePicker label="Thumbnail Episode" hint="Pilih gambar dari perangkat · JPG/PNG/WebP · maks. 5 MB" registerProps={thumbnailRegister} onFile={thumbnailPreview.readFile} previewSrc={thumbnailPreview.previewUrl || thumbnailUrl || null} />
              <label className={label}>Durasi Video{optional}<input inputMode="numeric" className={field} placeholder="10:30" {...register("durationSeconds", { pattern: { value: /^\d{1,3}:[0-5]\d$/, message: "Tulis seperti 10:30 untuk 10 menit 30 detik" } })} />{errors.durationSeconds && <small className="mt-1 block text-red-600">{errors.durationSeconds.message}</small>}<small className="mt-1 block font-normal text-[var(--muted)]">Contoh: 05:20 atau 12:45.</small></label>
            </div>
          </AdminFormSection>

          <AdminAdvancedSection guideId="episode-editorial" title="Ringkasan Cerita & Momen Penting" description="Tidak wajib. Buka bagian ini kalau kamu ingin memberi rangkuman cerita tambahan untuk penonton." defaultOpen={Boolean(initial?.recap || initial?.highlights.length)}>
            <div className="grid min-w-0 gap-5">
              <label className={label}>Ringkasan cerita{optional}<textarea rows={6} className={field} placeholder="Tuliskan rangkuman kejadian dalam episode ini." {...register("recap", { maxLength: 20000 })} /></label>
              <label className={label}>Momen penting{optional}<textarea rows={4} className={field} placeholder={"Ana datang ke studio\nManajer memanggil Ana\nAna dikeluarkan dari proyek"} {...register("highlights", { maxLength: 4000 })} /><small className="mt-1 block font-normal text-[var(--muted)]">Tulis satu kejadian penting di setiap baris.</small></label>
            </div>
          </AdminAdvancedSection>

          <AdminFormSection guideId="episode-publish" title="Tayangkan Episode" description="Kalau episode belum selesai diperiksa, biarkan pilihan ini mati. Aktifkan saat episode sudah siap ditonton.">
            <label className="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 font-bold text-[var(--text)]"><input type="checkbox" className="h-5 w-5 shrink-0 accent-red-600" {...register("isPublished")} /><span className="min-w-0 break-words">Tampilkan ke penonton</span></label>
          </AdminFormSection>

          <AdminAdvancedSection guideId="episode-advanced" title="Pengaturan Tambahan" description="Biasanya tidak perlu diubah. Buka hanya jika kamu ingin mengatur alamat halaman, memakai video Facebook lama, atau mengubah tampilan di Google." defaultOpen={Boolean(errors.slug || errors.thumbnailUrl || initial?.video_provider === "facebook" || initial?.seo_title || initial?.seo_description)}>
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <label className={`${label} sm:col-span-2`}>Alamat halaman<input className={field} {...slugRegister} onChange={(event) => { void slugRegister.onChange(event); setSlugManual(true); }} />{errors.slug && <small className="mt-1 block text-red-600">{errors.slug.message}</small>}<small className="mt-1 block font-normal text-[var(--muted)]">Sudah dibuat otomatis dari nomor episode dan judul. Sebaiknya jangan diubah jika tidak perlu.</small></label>
              <label className={label}>Video berasal dari<select className={field} {...register("videoProvider")}><option value="youtube">YouTube</option><option value="facebook">Facebook lama</option></select></label>
              <label className={label}>Link thumbnail{optional}<input type="url" className={field} placeholder="https://..." {...register("thumbnailUrl")} />{errors.thumbnailUrl && <small className="mt-1 block text-red-600">{errors.thumbnailUrl.message}</small>}<small className="mt-1 block font-normal text-[var(--muted)]">Kosongkan jika thumbnail sudah diunggah dari perangkat.</small></label>
              <label className={label}>Judul untuk Google{optional}<input className={field} placeholder="Jika kosong, judul episode akan digunakan." {...register("seoTitle", { maxLength: 200 })} /></label>
              <label className={label}>Deskripsi untuk Google{optional}<textarea rows={3} className={field} placeholder="Ringkasan yang ingin ditampilkan di hasil pencarian." {...register("seoDescription", { maxLength: 320 })} /></label>
            </div>
          </AdminAdvancedSection>
        </div>
        <EpisodePreviewSidebar provider={videoProvider} thumbnailSrc={thumbnailPreview.previewUrl || thumbnailUrl || null} title={title} episodeNumber={episodeNumber} seriesTitle={selectedSeriesTitle} durationSeconds={duration} published={published} />
      </div>
      <AdminFormActions cancelHref="/admin/episodes" saving={saving} disabled={series.length === 0} published={published} submitLabel={initial ? "Simpan Perubahan" : "Simpan Episode"} />
    </form>
  );
}
