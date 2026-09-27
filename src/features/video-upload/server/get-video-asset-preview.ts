import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getR2Config } from "@/lib/r2/config";
import { createR2PreviewUrl } from "@/lib/r2/preview";
import type { VideoAssetPreviewResponse } from "@/features/video-upload/server/contracts";
import { VideoUploadRequestError } from "@/features/video-upload/server/errors";

type AdminContext = {
  supabase: SupabaseClient<Database>;
  user: User;
};

export async function getReadyVideoAssetPreview(
  context: AdminContext,
  assetId: string,
): Promise<VideoAssetPreviewResponse> {
  const { data, error } = await context.supabase
    .from("video_assets")
    .select("id,object_key,status")
    .eq("id", assetId)
    .maybeSingle();

  if (error) {
    throw new VideoUploadRequestError("VIDEO_ASSET_PREVIEW_FAILED", 500);
  }
  if (!data || data.status !== "READY") {
    throw new VideoUploadRequestError("VIDEO_ASSET_NOT_PREVIEWABLE", 409);
  }

  const config = getR2Config();
  return {
    assetId: data.id,
    status: "READY",
    url: await createR2PreviewUrl(data.object_key, config),
    expiresInSeconds: config.previewUrlTtlSeconds,
  };
}
