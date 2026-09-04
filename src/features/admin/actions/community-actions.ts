"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/security/require-admin";

export async function setCommentHiddenAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const hidden = formData.get("hidden") === "true";
  if (!id) return;
  await supabase.from("episode_comments").update({ is_hidden: hidden }).eq("id", id);
  revalidatePath("/admin/community");
}

export async function deleteCommentAdminAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await supabase.from("episode_comments").update({
    is_hidden: true,
    deleted_at: new Date().toISOString(),
    body: "[Komentar dihapus admin]",
  }).eq("id", id);
  revalidatePath("/admin/community");
}

export async function setCommunityUserBlockedAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const userId = String(formData.get("userId") || "");
  const blocked = formData.get("blocked") === "true";
  if (!userId) return;
  await supabase.from("community_profiles").update({ is_blocked: blocked }).eq("user_id", userId);
  if (blocked) await supabase.from("episode_comments").update({ is_hidden: true }).eq("user_id", userId);
  revalidatePath("/admin/community");
}
