import "server-only";
import {
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getR2Client } from "@/lib/r2/client";
import type { R2Config } from "@/lib/r2/config";

export type R2ObjectMetadata = {
  sizeBytes: number;
  contentType: string | null;
  etag: string | null;
};

export async function headR2Object(
  objectKey: string,
  config: R2Config,
): Promise<R2ObjectMetadata> {
  const result = await getR2Client().send(
    new HeadObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
    }),
  );
  if (result.ContentLength == null) {
    throw new Error("R2 HEAD response did not include object size");
  }
  return {
    sizeBytes: result.ContentLength,
    contentType: result.ContentType ?? null,
    etag: result.ETag ?? null,
  };
}

export async function deleteR2Object(
  objectKey: string,
  config: R2Config,
): Promise<void> {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
    }),
  );
}

export function isR2NotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as {
    name?: string;
    Code?: string;
    $metadata?: { httpStatusCode?: number };
  };
  return (
    candidate.name === "NotFound" ||
    candidate.name === "NoSuchKey" ||
    candidate.Code === "NoSuchKey" ||
    candidate.$metadata?.httpStatusCode === 404
  );
}
