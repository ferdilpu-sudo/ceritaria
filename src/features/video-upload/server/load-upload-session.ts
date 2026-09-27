import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type {
  Database,
  VideoAssetRow,
  VideoUploadSessionRow,
} from "@/types/database.types";
import { VideoUploadRequestError } from "@/features/video-upload/server/errors";

type AdminContext = {
  supabase: SupabaseClient<Database>;
  user: User;
};

export type OwnedVideoUpload = {
  session: VideoUploadSessionRow;
  asset: VideoAssetRow;
};

export async function loadOwnedVideoUpload(
  context: AdminContext,
  sessionId: string,
): Promise<OwnedVideoUpload> {
  const { data: session, error: sessionError } = await context.supabase
    .from("video_upload_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("created_by", context.user.id)
    .maybeSingle();

  if (sessionError) {
    throw new VideoUploadRequestError("UPLOAD_SESSION_LOOKUP_FAILED", 500);
  }
  if (!session) {
    throw new VideoUploadRequestError("UPLOAD_SESSION_NOT_FOUND", 404);
  }

  const { data: asset, error: assetError } = await context.supabase
    .from("video_assets")
    .select("*")
    .eq("id", session.asset_id)
    .maybeSingle();

  if (assetError) {
    throw new VideoUploadRequestError("VIDEO_ASSET_LOOKUP_FAILED", 500);
  }
  if (!asset) {
    throw new VideoUploadRequestError("VIDEO_ASSET_NOT_FOUND", 404);
  }

  return { session, asset };
}

export function assertUploadSessionActive(session: VideoUploadSessionRow) {
  if (new Date(session.expires_at).getTime() <= Date.now()) {
    throw new VideoUploadRequestError("UPLOAD_SESSION_EXPIRED", 410);
  }
  if (
    session.status === "CANCELLED" ||
    session.status === "FAILED" ||
    session.status === "EXPIRED" ||
    session.status === "READY"
  ) {
    throw new VideoUploadRequestError("UPLOAD_SESSION_NOT_ACTIVE", 409);
  }
}
