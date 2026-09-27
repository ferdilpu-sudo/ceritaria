import { attachVideoAssetParamsSchema } from "@/features/video-upload/server/contracts";
import { attachReadyVideoAsset } from "@/features/video-upload/server/attach-video-asset";
import { videoUploadErrorResponse } from "@/features/video-upload/server/errors";
import { requireApiAdmin } from "@/lib/security/require-api-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ episodeId: string; assetId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const admin = await requireApiAdmin(request);
    const params = attachVideoAssetParamsSchema.parse(await context.params);
    return Response.json(
      await attachReadyVideoAsset(admin, params.episodeId, params.assetId),
    );
  } catch (error) {
    return videoUploadErrorResponse(error);
  }
}
