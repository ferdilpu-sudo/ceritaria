import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getR2Config } from "@/lib/r2/config";
import { deleteR2Object, headR2Object, isR2NotFoundError } from "@/lib/r2/object";
import type { Database } from "@/types/database.types";
import type { FinalizeVideoUploadResponse } from "@/features/video-upload/server/contracts";
import { VideoUploadRequestError } from "@/features/video-upload/server/errors";
import { loadOwnedVideoUpload } from "@/features/video-upload/server/load-upload-session";
import {
  UploadedObjectVerificationError,
  verifyUploadedVideoObject,
} from "@/features/video-upload/server/object-verification";

type AdminContext = {
  supabase: SupabaseClient<Database>;
  user: User;
};

export async function finalizeVideoUpload(
  context: AdminContext,
  sessionId: string,
): Promise<FinalizeVideoUploadResponse> {
  const { session, asset } = await loadOwnedVideoUpload(context, sessionId);

  if (session.status === "READY") {
    return {
      assetId: asset.id,
      status: "READY",
      sizeBytes: asset.actual_size_bytes ?? asset.expected_size_bytes,
      etag: asset.etag,
    };
  }
  if (
    session.status === "CANCELLED" ||
    session.status === "FAILED" ||
    session.status === "EXPIRED"
  ) {
    throw new VideoUploadRequestError("UPLOAD_SESSION_NOT_FINALIZABLE", 409);
  }

  const { error: stateError } = await context.supabase
    .from("video_upload_sessions")
    .update({ status: "VERIFYING" })
    .eq("id", session.id);
  if (stateError) {
    throw new VideoUploadRequestError("UPLOAD_SESSION_UPDATE_FAILED", 500);
  }

  const config = getR2Config();
  let metadata;
  try {
    metadata = await headR2Object(asset.object_key, config);
  } catch (error) {
    if (isR2NotFoundError(error)) {
      throw new VideoUploadRequestError("UPLOADED_OBJECT_NOT_FOUND", 409);
    }
    throw new VideoUploadRequestError("R2_OBJECT_VERIFY_FAILED", 502);
  }

  try {
    verifyUploadedVideoObject(
      asset.expected_size_bytes,
      asset.mime_type,
      metadata,
    );
  } catch (error) {
    if (!(error instanceof UploadedObjectVerificationError)) throw error;
    await deleteR2Object(asset.object_key, config).catch(() => undefined);
    await context.supabase.rpc("fail_video_upload_records", {
      p_session_id: session.id,
    });
    throw new VideoUploadRequestError(error.code, 422);
  }

  const { error: finalizeError } = await context.supabase.rpc(
    "finalize_video_upload_records",
    {
      p_session_id: session.id,
      p_actual_size_bytes: metadata.sizeBytes,
      p_etag: metadata.etag,
    },
  );
  if (finalizeError) {
    throw new VideoUploadRequestError("UPLOAD_FINALIZE_PERSIST_FAILED", 500);
  }

  return {
    assetId: asset.id,
    status: "READY",
    sizeBytes: metadata.sizeBytes,
    etag: metadata.etag,
  };
}
