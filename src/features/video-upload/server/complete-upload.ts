import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getR2Config } from "@/lib/r2/config";
import {
  completeR2MultipartUpload,
  isNoSuchUploadError,
} from "@/lib/r2/multipart";
import { headR2Object } from "@/lib/r2/object";
import type { Database } from "@/types/database.types";
import type {
  CompleteVideoUploadRequest,
  CompleteVideoUploadResponse,
} from "@/features/video-upload/server/contracts";
import {
  CompletedPartsError,
  normalizeCompletedParts,
} from "@/features/video-upload/server/completed-parts";
import { VideoUploadRequestError } from "@/features/video-upload/server/errors";
import {
  assertUploadSessionActive,
  loadOwnedVideoUpload,
} from "@/features/video-upload/server/load-upload-session";
import { verifyUploadedVideoObject } from "@/features/video-upload/server/object-verification";

type AdminContext = {
  supabase: SupabaseClient<Database>;
  user: User;
};

export async function completeVideoUpload(
  context: AdminContext,
  sessionId: string,
  input: CompleteVideoUploadRequest,
): Promise<CompleteVideoUploadResponse> {
  const { session, asset } = await loadOwnedVideoUpload(context, sessionId);

  if (
    session.status === "UPLOADED" ||
    session.status === "VERIFYING" ||
    session.status === "READY"
  ) {
    return { status: "UPLOADED" };
  }
  assertUploadSessionActive(session);

  if (
    session.mode !== "MULTIPART" ||
    !session.r2_upload_id ||
    !session.part_count
  ) {
    throw new VideoUploadRequestError("MULTIPART_SESSION_REQUIRED", 409);
  }

  let parts;
  try {
    parts = normalizeCompletedParts(input, session.part_count);
  } catch (error) {
    if (error instanceof CompletedPartsError) {
      throw new VideoUploadRequestError(error.code, 400);
    }
    throw error;
  }

  const { error: stateError } = await context.supabase
    .from("video_upload_sessions")
    .update({ status: "COMPLETING" })
    .eq("id", session.id);
  if (stateError) {
    throw new VideoUploadRequestError("UPLOAD_SESSION_UPDATE_FAILED", 500);
  }

  const config = getR2Config();
  let etag: string | null = null;
  try {
    etag = await completeR2MultipartUpload(
      asset.object_key,
      session.r2_upload_id,
      parts,
      config,
    );
  } catch (error) {
    if (!isNoSuchUploadError(error)) {
      throw new VideoUploadRequestError("R2_MULTIPART_COMPLETE_FAILED", 502);
    }

    try {
      const metadata = await headR2Object(asset.object_key, config);
      verifyUploadedVideoObject(
        asset.expected_size_bytes,
        asset.mime_type,
        metadata,
      );
      etag = metadata.etag;
    } catch {
      throw new VideoUploadRequestError("R2_MULTIPART_RECOVERY_FAILED", 502);
    }
  }

  const { error: persistError } = await context.supabase.rpc(
    "mark_video_upload_uploaded",
    {
      p_session_id: session.id,
      p_etag: etag,
    },
  );
  if (persistError) {
    throw new VideoUploadRequestError("UPLOAD_COMPLETE_PERSIST_FAILED", 500);
  }

  return { status: "UPLOADED" };
}
