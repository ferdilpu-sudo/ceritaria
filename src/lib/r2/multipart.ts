import "server-only";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client } from "@/lib/r2/client";
import type { R2Config } from "@/lib/r2/config";

export async function signR2UploadPart(
  objectKey: string,
  uploadId: string,
  partNumber: number,
  config: R2Config,
): Promise<string> {
  return getSignedUrl(
    getR2Client(),
    new UploadPartCommand({
      Bucket: config.bucket,
      Key: objectKey,
      UploadId: uploadId,
      PartNumber: partNumber,
    }),
    {
      expiresIn: Math.min(
        config.uploadUrlTtlSeconds,
        config.uploadSessionTtlSeconds,
      ),
    },
  );
}
