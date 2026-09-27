import "server-only";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client } from "@/lib/r2/client";
import type { R2Config } from "@/lib/r2/config";

export async function createR2PreviewUrl(
  objectKey: string,
  config: R2Config,
): Promise<string> {
  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
      ResponseContentType: "video/mp4",
    }),
    { expiresIn: config.previewUrlTtlSeconds },
  );
}
