"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/security/require-admin";
import { seriesFormSchema, splitCommaList } from "@/features/admin/services/schemas";
import { uploadAdminImage } from "@/features/admin/services/media-upload";
import type { ActionResult } from "@/features/admin/types/action-result";

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "true";
}

export async function saveSeriesAction(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  try {
    const raw = {
      id: String(formData.get("id") || "") || undefined,
      slug: String(formData.get("slug") || ""),
      title: String(formData.get("title") || ""),
      shortSynopsis: String(formData.get("shortSynopsis") || ""),
      synopsis: String(formData.get("synopsis") || ""),
      genres: String(formData.get("genres") || ""),
      coverUrl: String(formData.get("coverUrl") || ""),
      heroUrl: String(formData.get("heroUrl") || ""),
      isFeatured: readBoolean(formData, "isFeatured"),
      isPublished: readBoolean(formData, "isPublished"),
      seoTitle: String(formData.get("seoTitle") || ""),
      seoDescription: String(formData.get("seoDescription") || ""),
    };
    const parsed = seriesFormSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Data series tidak valid." };
    }

    const values = parsed.data;
    const id = values.id ?? crypto.randomUUID();
    const { data: existing } = values.id
      ? await supabase.from("series").select("published_at,slug").eq("id", id).maybeSingle()
      : { data: null };

    let coverUrl = values.coverUrl;
    let heroUrl = values.heroUrl;
    const coverFile = formData.get("coverFile");
    const heroFile = formData.get("heroFile");

    if (coverFile instanceof File && coverFile.size > 0) {
      coverUrl = await uploadAdminImage(supabase, "series-media", coverFile, id);
    }
    if (heroFile instanceof File && heroFile.size > 0) {
      heroUrl = await uploadAdminImage(supabase, "series-media", heroFile, id);
    }

    const payload = {
      id,
      slug: values.slug,
      title: values.title,
      short_synopsis: values.shortSynopsis,
      synopsis: values.synopsis,
      genres: splitCommaList(values.genres),
      cover_url: coverUrl,
      hero_url: heroUrl,
      is_featured: values.isFeatured,
      is_published: values.isPublished,
      published_at: values.isPublished ? (existing?.published_at ?? new Date().toISOString()) : (existing?.published_at ?? null),
      seo_title: values.seoTitle,
      seo_description: values.seoDescription,
    };
    const query = values.id
      ? supabase.from("series").update(payload).eq("id", id)
      : supabase.from("series").insert(payload);
    const { error } = await query;
    if (error) {
      return { ok: false, message: error.code === "23505" ? "Slug series sudah dipakai." : error.message };
    }

    updateTag("public-content");
    revalidatePath("/");
    revalidatePath(`/series/${values.slug}`);
    if (existing?.slug && existing.slug !== values.slug) revalidatePath(`/series/${existing.slug}`);
    return { ok: true, redirectTo: "/admin/series" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Gagal menyimpan series." };
  }
}

export async function deleteSeriesAction(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  try {
    const { data: existing } = await supabase.from("series").select("slug").eq("id", id).maybeSingle();
    const { error } = await supabase.rpc("soft_delete_series", { target_id: id });
    if (error) return { ok: false, message: error.message };
    updateTag("public-content");
    revalidatePath("/");
    if (existing) revalidatePath(`/series/${existing.slug}`);
    return { ok: true, redirectTo: "/admin/series" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Gagal menghapus series." };
  }
}
