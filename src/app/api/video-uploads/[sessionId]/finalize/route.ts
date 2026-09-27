import { finalizeVideoUpload } from "@/features/video-upload/server/finalize-upload";
import { videoUploadErrorResponse } from "@/features/video-upload/server/errors";
import { requireApiAdmin } from "@/lib/security/require-api-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const admin = await requireApiAdmin(request);
    const { sessionId } = await context.params;
    return Response.json(await finalizeVideoUpload(admin, sessionId));
  } catch (error) {
    return videoUploadErrorResponse(error);
  }
}
