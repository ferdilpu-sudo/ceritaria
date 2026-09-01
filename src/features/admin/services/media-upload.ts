import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 5 * 1024 * 1024;

export async function uploadAdminImage(
  supabase: SupabaseClient<Database>,
  bucket: "series-media" | "episode-media",
  file: File,
  ownerId: string,
) {
  if (!allowedImageTypes.has(file.type)) throw new Error("Format gambar harus JPG, PNG, atau WebP.");
  if (file.size > maxImageBytes) throw new Error("Ukuran gambar maksimal 5 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${ownerId}/${crypto.randomUUID()}.${extension}`;
  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Upload gagal: ${error.message}`);

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
