import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createR2UploadUrl } from "@/features/admin/services/r2-presign";
import { isAllowedImageType, isMediaKind, validateImageMetadata } from "@/features/admin/services/media-upload-config";

export const dynamic = "force-dynamic";

function json(message: string, status: number) {
  return Response.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return json("Sesi admin sudah berakhir. Silakan masuk lagi.", 401);

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (adminError || !admin) return json("Akun ini tidak memiliki akses admin.", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json("Permintaan upload tidak valid.", 400);
  }

  if (!body || typeof body !== "object") return json("Permintaan upload tidak valid.", 400);
  const { kind, contentType, size } = body as Record<string, unknown>;
  if (!isMediaKind(kind)) return json("Jenis gambar tidak dikenali.", 400);
  const validation = validateImageMetadata(contentType, size);
  if (validation) return json(validation, 400);
  if (!isAllowedImageType(contentType)) return json("Format gambar tidak didukung.", 400);

  try {
    const signed = await createR2UploadUrl(kind, contentType);
    return Response.json(signed, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.warn("R2 media presign unavailable", error instanceof Error ? error.message : "unknown error");
    return json("Penyimpanan gambar belum siap. Coba lagi beberapa saat.", 503);
  }
}
