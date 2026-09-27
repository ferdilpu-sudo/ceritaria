import "server-only";
import {
  CompleteMultipartUploadCommand,
  UploadPartCommand,
  type CompletedPart,
} from "@aws-sdk/client-s3";
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

export async function completeR2MultipartUpload(
  objectKey: string,
  uploadId: string,
  parts: CompletedPart[],
  config: R2Config,
): Promise<string | null> {
  const result = await getR2Client().send(
    new CompleteMultipartUploadCommand({
      Bucket: config.bucket,
      Key: objectKey,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    }),
  );
  return result.ETag ?? null;
}

export function isNoSuchUploadError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: string; Code?: string };
  return candidate.name === "NoSuchUpload" || candidate.Code === "NoSuchUpload";
}
