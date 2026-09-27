import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getR2Config } from "@/lib/r2/config";
import {
  abortR2MultipartUpload,
  prepareR2UploadTarget,
} from "@/lib/r2/upload-target";
import {
  createVideoUploadPlan,
  validateVideoUploadInput,
} from "@/lib/r2/upload-policy";
import type { Database } from "@/types/database.types";
import type {
  CreateVideoUploadRequest,
  CreateVideoUploadResponse,
} from "@/features/video-upload/server/contracts";
import { buildVideoObjectKey } from "@/features/video-upload/server/object-key";
import { VideoUploadRequestError } from "@/features/video-upload/server/errors";

type AdminContext = {
  supabase: SupabaseClient<Database>;
  user: User;
};

export async function createVideoUploadSession(
  context: AdminContext,
  input: CreateVideoUploadRequest,
): Promise<CreateVideoUploadResponse> {
  const config = getR2Config();
  validateVideoUploadInput(input.mimeType, input.sizeBytes, config);

  const { data: episode, error: episodeError } = await context.supabase
    .from("episodes")
    .select("id,series_id")
    .eq("id", input.episodeId)
    .is("deleted_at", null)
    .maybeSingle();

  if (episodeError) {
    throw new VideoUploadRequestError("EPISODE_LOOKUP_FAILED", 500);
  }
  if (!episode) {
    throw new VideoUploadRequestError("EPISODE_NOT_FOUND", 404);
  }

  const plan = createVideoUploadPlan(input.sizeBytes, config);
  const assetId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const objectKey = buildVideoObjectKey(episode.series_id, episode.id, assetId);
  const expiresAt = new Date(
    Date.now() + config.uploadSessionTtlSeconds * 1000,
  ).toISOString();

  const prepared = await prepareR2UploadTarget(
    objectKey,
    input.mimeType,
    plan,
    config,
  );

  const { error: persistError } = await context.supabase.rpc(
    "create_video_upload_records",
    {
      p_asset_id: assetId,
      p_session_id: sessionId,
      p_episode_id: episode.id,
      p_object_key: objectKey,
      p_mime_type: input.mimeType,
      p_expected_size_bytes: input.sizeBytes,
      p_checksum_sha256: input.checksumSha256 ?? null,
      p_mode: plan.mode,
      p_r2_upload_id: prepared.mode === "MULTIPART" ? prepared.uploadId : null,
      p_part_size_bytes:
        plan.mode === "MULTIPART" ? plan.partSizeBytes : null,
      p_part_count: plan.mode === "MULTIPART" ? plan.partCount : null,
      p_expires_at: expiresAt,
    },
  );

  if (persistError) {
    if (prepared.mode === "MULTIPART") {
      await abortR2MultipartUpload(objectKey, prepared.uploadId, config)
        .catch(() => undefined);
    }
    throw new VideoUploadRequestError("UPLOAD_SESSION_PERSIST_FAILED", 500);
  }

  if (prepared.mode === "SINGLE") {
    return {
      assetId,
      sessionId,
      expiresAt,
      upload: {
        mode: "SINGLE",
        url: prepared.uploadUrl,
        headers: { "Content-Type": "video/mp4" },
      },
    };
  }

  return {
    assetId,
    sessionId,
    expiresAt,
    upload: {
      mode: "MULTIPART",
      partSizeBytes: plan.partSizeBytes!,
      partCount: plan.partCount!,
    },
  };
}
