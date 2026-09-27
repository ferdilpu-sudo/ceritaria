import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getR2Config } from "@/lib/r2/config";
import { deleteR2Object } from "@/lib/r2/object";
import type { Database } from "@/types/database.types";
import type { AttachVideoAssetResponse } from "@/features/video-upload/server/contracts";
import { VideoUploadRequestError } from "@/features/video-upload/server/errors";

type AdminContext = {
  supabase: SupabaseClient<Database>;
  user: User;
};

export async function attachReadyVideoAsset(
  context: AdminContext,
  episodeId: string,
  assetId: string,
): Promise<AttachVideoAssetResponse> {
  const { data: previousAssetId, error } = await context.supabase.rpc(
    "attach_ready_video_asset",
    {
      target_episode_id: episodeId,
      target_asset_id: assetId,
    },
  );

  if (error) {
    if (error.code === "22023") {
      throw new VideoUploadRequestError("VIDEO_ASSET_NOT_ATTACHABLE", 409);
    }
    throw new VideoUploadRequestError("VIDEO_ASSET_ATTACH_FAILED", 500);
  }

  const replacedAssetId =
    typeof previousAssetId === "string" && previousAssetId !== assetId
      ? previousAssetId
      : null;

  if (replacedAssetId) {
    await cleanupReplacedAsset(context, replacedAssetId);
  }

  return {
    episodeId,
    assetId,
    status: "ATTACHED",
    replacedAssetId,
  };
}

async function cleanupReplacedAsset(
  context: AdminContext,
  assetId: string,
): Promise<void> {
  const { data } = await context.supabase
    .from("video_assets")
    .select("object_key,status")
    .eq("id", assetId)
    .eq("status", "REPLACED")
    .maybeSingle();

  if (!data?.object_key) return;

  const config = getR2Config();
  await deleteR2Object(data.object_key, config).catch(() => undefined);
}
