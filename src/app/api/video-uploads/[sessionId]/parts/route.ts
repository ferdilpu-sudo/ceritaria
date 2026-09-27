import { authorizeVideoPartRequestSchema } from "@/features/video-upload/server/contracts";
import { authorizeUploadPart } from "@/features/video-upload/server/authorize-upload-part";
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
    const input = authorizeVideoPartRequestSchema.parse(await request.json());
    const result = await authorizeUploadPart(admin, sessionId, input);
    return Response.json(result);
  } catch (error) {
    return videoUploadErrorResponse(error);
  }
}
