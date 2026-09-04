import { createR2UploadUrl } from "@/features/admin/services/r2-presign";
import { isAllowedImageType, validateImageMetadata } from "@/features/admin/services/media-upload-config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function json(message: string, status: number) {
  return Response.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return json("Masuk ke akun untuk mengubah foto profil.", 401);

  const { data: profile } = await supabase
    .from("community_profiles")
    .select("is_blocked")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile || profile.is_blocked) return json("Akun ini tidak dapat mengubah profil.", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json("Permintaan upload tidak valid.", 400);
  }

  if (!body || typeof body !== "object") return json("Permintaan upload tidak valid.", 400);
  const { contentType, size } = body as Record<string, unknown>;
  const validation = validateImageMetadata(contentType, size);
  if (validation) return json(validation, 400);
  if (!isAllowedImageType(contentType)) return json("Format gambar tidak didukung.", 400);

  try {
    const signed = await createR2UploadUrl("community-avatar", contentType);
    return Response.json(signed, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.warn("R2 avatar presign unavailable", error instanceof Error ? error.message : "unknown error");
    return json("Penyimpanan foto belum siap. Coba lagi beberapa saat.", 503);
  }
}
