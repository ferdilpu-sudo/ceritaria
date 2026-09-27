import "server-only";
import {
  AbortMultipartUploadCommand,
  CreateMultipartUploadCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client } from "@/lib/r2/client";
import type { R2Config } from "@/lib/r2/config";
import type { VideoUploadPlan } from "@/lib/r2/upload-policy";

export type PreparedR2Upload =
  | { mode: "SINGLE"; uploadUrl: string }
  | { mode: "MULTIPART"; uploadId: string };

export async function prepareR2UploadTarget(
  objectKey: string,
  mimeType: "video/mp4",
  plan: VideoUploadPlan,
  config: R2Config,
): Promise<PreparedR2Upload> {
  const client = getR2Client();

  if (plan.mode === "SINGLE") {
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
      ContentType: mimeType,
    });
    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: Math.min(
        config.uploadUrlTtlSeconds,
        config.uploadSessionTtlSeconds,
      ),
      signableHeaders: new Set(["content-type"]),
    });
    return { mode: "SINGLE", uploadUrl };
  }

  const created = await client.send(
    new CreateMultipartUploadCommand({
      Bucket: config.bucket,
      Key: objectKey,
      ContentType: mimeType,
    }),
  );
  if (!created.UploadId) {
    throw new Error("R2 multipart upload did not return an upload ID");
  }
  return { mode: "MULTIPART", uploadId: created.UploadId };
}

export async function abortR2MultipartUpload(
  objectKey: string,
  uploadId: string,
  config: R2Config,
): Promise<void> {
  await getR2Client().send(
    new AbortMultipartUploadCommand({
      Bucket: config.bucket,
      Key: objectKey,
      UploadId: uploadId,
    }),
  );
}
