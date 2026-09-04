"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/security/require-admin";

function pollRedirect(status: string): never {
  redirect(`/admin/community/polls?status=${encodeURIComponent(status)}`);
}

export async function createPollAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const episodeId = String(formData.get("episodeId") || "");
  const question = String(formData.get("question") || "").trim();
  const options = String(formData.get("options") || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!episodeId || question.length < 4 || question.length > 160 || options.length < 2 || options.length > 6) {
    pollRedirect("invalid");
  }

  const { error } = await supabase.rpc("create_episode_poll", {
    p_episode_id: episodeId,
    p_question: question,
    p_options: options,
  });
  if (error) pollRedirect(error.code === "23505" ? "exists" : "error");
  pollRedirect("created");
}

export async function setPollActiveAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const active = formData.get("active") === "true";
  if (!id) pollRedirect("invalid");
  const { error } = await supabase.from("episode_polls").update({ is_active: active }).eq("id", id);
  pollRedirect(error ? "error" : active ? "opened" : "closed");
}

export async function deletePollAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) pollRedirect("invalid");
  const { error } = await supabase.from("episode_polls").delete().eq("id", id);
  pollRedirect(error ? "error" : "deleted");
}
