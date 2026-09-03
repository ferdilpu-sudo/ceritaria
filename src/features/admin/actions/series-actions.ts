"use server";

import { requireAdmin } from "@/lib/security/require-admin";
import { seriesFormSchema, splitCommaList } from "@/features/admin/services/schemas";
import { zodFieldErrors } from "@/features/admin/services/form-errors";
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
      return {
        ok: false,
        message: "Ada bagian yang perlu diperbaiki sebelum disimpan.",
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }

    const values = parsed.data;
    const id = values.id ?? crypto.randomUUID();
    const { data: existing } = values.id
      ? await supabase.from("series").select("published_at").eq("id", id).maybeSingle()
      : { data: null };

    const payload = {
      id,
      slug: values.slug,
      title: values.title,
      short_synopsis: values.shortSynopsis,
      synopsis: values.synopsis,
      genres: splitCommaList(values.genres),
      cover_url: values.coverUrl,
      hero_url: values.heroUrl,
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
      const slugError = error.code === "23505";
      return {
        ok: false,
        message: slugError ? "Alamat halaman ini sudah dipakai series lain." : "Series belum berhasil disimpan. Coba lagi.",
        fieldErrors: slugError ? { slug: "Coba gunakan alamat halaman yang berbeda." } : undefined,
      };
    }

    const state = values.id ? "updated" : "created";
    const view = values.isPublished ? `&view=${encodeURIComponent(`/series/${values.slug}`)}` : "";
    return { ok: true, redirectTo: `/admin/series?saved=${state}${view}` };
  } catch {
    return { ok: false, message: "Series belum berhasil disimpan. Coba lagi beberapa saat." };
  }
}

export async function deleteSeriesAction(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  try {
    const { error } = await supabase.rpc("soft_delete_series", { target_id: id });
    if (error) return { ok: false, message: "Series belum berhasil dihapus. Coba lagi." };
    return { ok: true, redirectTo: "/admin/series" };
  } catch {
    return { ok: false, message: "Series belum berhasil dihapus. Coba lagi beberapa saat." };
  }
}
