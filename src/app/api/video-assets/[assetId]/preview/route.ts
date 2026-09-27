import { videoAssetPreviewParamsSchema } from "@/features/video-upload/server/contracts";
import { getReadyVideoAssetPreview } from "@/features/video-upload/server/get-video-asset-preview";
import { videoUploadErrorResponse } from "@/features/video-upload/server/errors";
import { requireApiAdmin } from "@/lib/security/require-api-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ assetId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const admin = await requireApiAdmin(request);
    const params = videoAssetPreviewParamsSchema.parse(await context.params);
    return Response.json(
      await getReadyVideoAssetPreview(admin, params.assetId),
    );
  } catch (error) {
    return videoUploadErrorResponse(error);
  }
}
