import { completeVideoUploadRequestSchema } from "@/features/video-upload/server/contracts";
import { completeVideoUpload } from "@/features/video-upload/server/complete-upload";
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
    const input = completeVideoUploadRequestSchema.parse(await request.json());
    return Response.json(await completeVideoUpload(admin, sessionId, input));
  } catch (error) {
    return videoUploadErrorResponse(error);
  }
}
