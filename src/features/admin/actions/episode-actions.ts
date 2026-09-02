"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/security/require-admin";
import { episodeFormSchema, splitLineList } from "@/features/admin/services/schemas";
import { zodFieldErrors } from "@/features/admin/services/form-errors";
import { uploadAdminImage } from "@/features/admin/services/media-upload";
import type { ActionResult } from "@/features/admin/types/action-result";

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "true";
}

export async function saveEpisodeAction(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  try {
    const raw = {
      id: String(formData.get("id") || "") || undefined,
      seriesId: String(formData.get("seriesId") || ""),
      episodeNumber: String(formData.get("episodeNumber") || ""),
      slug: String(formData.get("slug") || ""),
      title: String(formData.get("title") || ""),
      shortSynopsis: String(formData.get("shortSynopsis") || ""),
      recap: String(formData.get("recap") || ""),
      highlights: String(formData.get("highlights") || ""),
      videoProvider: String(formData.get("videoProvider") || "youtube"),
      videoUrl: String(formData.get("videoUrl") || ""),
      thumbnailUrl: String(formData.get("thumbnailUrl") || ""),
      durationSeconds: String(formData.get("durationSeconds") || ""),
      isPublished: readBoolean(formData, "isPublished"),
      seoTitle: String(formData.get("seoTitle") || ""),
      seoDescription: String(formData.get("seoDescription") || ""),
    };
    const parsed = episodeFormSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Ada bagian yang perlu diperbaiki sebelum disimpan.",
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }

    const values = parsed.data;
    const id = values.id ?? crypto.randomUUID();
    const { data: existing } = values.id
      ? await supabase.from("episodes").select("published_at,series_id,slug").eq("id", id).maybeSingle()
      : { data: null };
    let thumbnailUrl = values.thumbnailUrl;
    const file = formData.get("thumbnailFile");
    if (file instanceof File && file.size > 0) {
      thumbnailUrl = await uploadAdminImage(supabase, "episode-media", file, id);
    }

    const payload = {
      id,
      series_id: values.seriesId,
      episode_number: values.episodeNumber,
      slug: values.slug,
      title: values.title,
      short_synopsis: values.shortSynopsis,
      recap: values.recap,
      highlights: splitLineList(values.highlights),
      video_provider: values.videoProvider,
      video_url: values.videoUrl,
      thumbnail_url: thumbnailUrl,
      duration_seconds: values.durationSeconds,
      is_published: values.isPublished,
      published_at: values.isPublished ? (existing?.published_at ?? new Date().toISOString()) : existing?.published_at ?? null,
      seo_title: values.seoTitle,
      seo_description: values.seoDescription,
    };
    const query = values.id
      ? supabase.from("episodes").update(payload).eq("id", id)
      : supabase.from("episodes").insert(payload);
    const { error } = await query;
    if (error) {
      const duplicate = error.code === "23505";
      return {
        ok: false,
        message: duplicate ? "Nomor episode ini sudah dipakai, atau alamat halamannya bentrok." : error.message,
        fieldErrors: duplicate ? { episodeNumber: "Coba cek nomor episode. Nomor ini mungkin sudah ada.", slug: "Coba gunakan alamat halaman yang berbeda." } : undefined,
      };
    }

    const { data: series } = await supabase.from("series").select("slug").eq("id", values.seriesId).maybeSingle();
    const { data: oldSeries } = existing?.series_id
      ? await supabase.from("series").select("slug").eq("id", existing.series_id).maybeSingle()
      : { data: null };
    updateTag("public-content");
    revalidatePath("/");
    if (series) {
      revalidatePath(`/series/${series.slug}`);
      revalidatePath(`/series/${series.slug}/${values.slug}`);
    }
    if (oldSeries && (oldSeries.slug !== series?.slug || existing?.slug !== values.slug)) {
      revalidatePath(`/series/${oldSeries.slug}/${existing?.slug}`);
    }
    return { ok: true, redirectTo: `/admin/episodes?saved=${values.id ? "updated" : "created"}` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Episode belum berhasil disimpan. Coba lagi." };
  }
}

export async function deleteEpisodeAction(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  try {
    const { data: existing } = await supabase.from("episodes").select("series_id,slug").eq("id", id).maybeSingle();
    const { data: series } = existing
      ? await supabase.from("series").select("slug").eq("id", existing.series_id).maybeSingle()
      : { data: null };
    const { error } = await supabase.from("episodes").update({ deleted_at: new Date().toISOString(), is_published: false }).eq("id", id);
    if (error) return { ok: false, message: error.message };
    updateTag("public-content");
    revalidatePath("/");
    if (series && existing) {
      revalidatePath(`/series/${series.slug}`);
      revalidatePath(`/series/${series.slug}/${existing.slug}`);
    }
    return { ok: true, redirectTo: "/admin/episodes" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Episode belum berhasil dihapus. Coba lagi." };
  }
}
