import { getVideoUploadStatus } from "@/features/video-upload/server/get-upload-status";
import { videoUploadErrorResponse } from "@/features/video-upload/server/errors";
import { requireApiAdmin } from "@/lib/security/require-api-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const admin = await requireApiAdmin(request);
    const { sessionId } = await context.params;
    return Response.json(await getVideoUploadStatus(admin, sessionId));
  } catch (error) {
    return videoUploadErrorResponse(error);
  }
}
