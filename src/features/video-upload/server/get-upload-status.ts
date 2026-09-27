import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { VideoUploadStatusResponse } from "@/features/video-upload/server/contracts";
import { loadOwnedVideoUpload } from "@/features/video-upload/server/load-upload-session";

type AdminContext = {
  supabase: SupabaseClient<Database>;
  user: User;
};

export async function getVideoUploadStatus(
  context: AdminContext,
  sessionId: string,
): Promise<VideoUploadStatusResponse> {
  const { session, asset } = await loadOwnedVideoUpload(context, sessionId);
  return {
    sessionId: session.id,
    assetId: asset.id,
    mode: session.mode,
    sessionStatus: session.status,
    assetStatus: asset.status,
    expiresAt: session.expires_at,
    expired: new Date(session.expires_at).getTime() <= Date.now(),
    expectedSizeBytes: asset.expected_size_bytes,
    actualSizeBytes: asset.actual_size_bytes,
    partSizeBytes: session.part_size_bytes,
    partCount: session.part_count,
  };
}
