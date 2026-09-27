import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getR2Config } from "@/lib/r2/config";
import { signR2UploadPart } from "@/lib/r2/multipart";
import type { Database } from "@/types/database.types";
import type {
  AuthorizeVideoPartRequest,
  AuthorizeVideoPartResponse,
} from "@/features/video-upload/server/contracts";
import {
  assertUploadSessionActive,
  loadOwnedVideoUpload,
} from "@/features/video-upload/server/load-upload-session";
import { expectedMultipartPartSize } from "@/features/video-upload/server/part-layout";
import { VideoUploadRequestError } from "@/features/video-upload/server/errors";

type AdminContext = {
  supabase: SupabaseClient<Database>;
  user: User;
};

export async function authorizeUploadPart(
  context: AdminContext,
  sessionId: string,
  input: AuthorizeVideoPartRequest,
): Promise<AuthorizeVideoPartResponse> {
  const { session, asset } = await loadOwnedVideoUpload(context, sessionId);
  assertUploadSessionActive(session);

  if (
    session.mode !== "MULTIPART" ||
    !session.r2_upload_id ||
    !session.part_size_bytes ||
    !session.part_count
  ) {
    throw new VideoUploadRequestError("MULTIPART_SESSION_REQUIRED", 409);
  }

  if (input.partNumber > session.part_count) {
    throw new VideoUploadRequestError("INVALID_PART_NUMBER", 400);
  }

  const sizeBytes = expectedMultipartPartSize(
    asset.expected_size_bytes,
    session.part_size_bytes,
    session.part_count,
    input.partNumber,
  );
  if (sizeBytes <= 0) {
    throw new VideoUploadRequestError("INVALID_MULTIPART_LAYOUT", 500);
  }

  const url = await signR2UploadPart(
    asset.object_key,
    session.r2_upload_id,
    input.partNumber,
    getR2Config(),
  );

  if (session.status === "CREATED") {
    const { error } = await context.supabase
      .from("video_upload_sessions")
      .update({ status: "UPLOADING" })
      .eq("id", session.id)
      .eq("status", "CREATED");
    if (error) {
      throw new VideoUploadRequestError("UPLOAD_SESSION_UPDATE_FAILED", 500);
    }
  }

  return { partNumber: input.partNumber, sizeBytes, url };
}
