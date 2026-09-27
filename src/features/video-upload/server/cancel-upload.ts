import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getR2Config } from "@/lib/r2/config";
import { isNoSuchUploadError } from "@/lib/r2/multipart";
import { deleteR2Object } from "@/lib/r2/object";
import { abortR2MultipartUpload } from "@/lib/r2/upload-target";
import type { Database } from "@/types/database.types";
import type { CancelVideoUploadResponse } from "@/features/video-upload/server/contracts";
import { VideoUploadRequestError } from "@/features/video-upload/server/errors";
import { loadOwnedVideoUpload } from "@/features/video-upload/server/load-upload-session";

type AdminContext = {
  supabase: SupabaseClient<Database>;
  user: User;
};

export async function cancelVideoUpload(
  context: AdminContext,
  sessionId: string,
): Promise<CancelVideoUploadResponse> {
  const { session, asset } = await loadOwnedVideoUpload(context, sessionId);
  if (session.status === "READY") {
    throw new VideoUploadRequestError("READY_UPLOAD_CANNOT_CANCEL", 409);
  }
  if (session.status === "CANCELLED") {
    return { status: "CANCELLED" };
  }

  const config = getR2Config();

  if (session.mode === "MULTIPART" && session.r2_upload_id) {
    try {
      await abortR2MultipartUpload(
        asset.object_key,
        session.r2_upload_id,
        config,
      );
    } catch (error) {
      if (!isNoSuchUploadError(error)) {
        throw new VideoUploadRequestError("R2_MULTIPART_ABORT_FAILED", 502);
      }
    }
  }

  try {
    await deleteR2Object(asset.object_key, config);
  } catch {
    throw new VideoUploadRequestError("R2_OBJECT_DELETE_FAILED", 502);
  }

  const { error: cancelError } = await context.supabase.rpc(
    "cancel_video_upload_records",
    { p_session_id: session.id },
  );
  if (cancelError) {
    throw new VideoUploadRequestError("UPLOAD_CANCEL_PERSIST_FAILED", 500);
  }

  return { status: "CANCELLED" };
}
