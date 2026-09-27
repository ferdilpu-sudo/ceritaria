import { createVideoUploadRequestSchema } from "@/features/video-upload/server/contracts";
import { createVideoUploadSession } from "@/features/video-upload/server/create-upload-session";
import { videoUploadErrorResponse } from "@/features/video-upload/server/errors";
import { requireApiAdmin } from "@/lib/security/require-api-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const admin = await requireApiAdmin(request);
    const input = createVideoUploadRequestSchema.parse(await request.json());
    const result = await createVideoUploadSession(admin, input);
    return Response.json(result, { status: 201 });
  } catch (error) {
    return videoUploadErrorResponse(error);
  }
}
