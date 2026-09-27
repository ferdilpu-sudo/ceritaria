import type { R2Config } from "@/lib/r2/config";

const mib = 1024 * 1024;
const minPartBytes = 5 * mib;
const maxPartBytes = 5 * 1024 * 1024 * 1024;
const maxParts = 10_000;

export type VideoUploadPlan =
  | { mode: "SINGLE"; partSizeBytes: null; partCount: null }
  | { mode: "MULTIPART"; partSizeBytes: number; partCount: number };

export function validateVideoUploadInput(
  mimeType: string,
  sizeBytes: number,
  config: R2Config,
) {
  if (mimeType !== "video/mp4") {
    throw new VideoUploadPolicyError("UNSUPPORTED_MIME");
  }
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes <= 0) {
    throw new VideoUploadPolicyError("INVALID_SIZE");
  }
  if (sizeBytes > config.maxVideoBytes) {
    throw new VideoUploadPolicyError("FILE_TOO_LARGE");
  }
}

export function createVideoUploadPlan(
  sizeBytes: number,
  config: R2Config,
): VideoUploadPlan {
  if (sizeBytes <= config.singleUploadThresholdBytes) {
    return { mode: "SINGLE", partSizeBytes: null, partCount: null };
  }

  const requiredPartBytes = Math.ceil(sizeBytes / maxParts);
  const basePartBytes = Math.max(
    config.multipartPartSizeBytes,
    minPartBytes,
    requiredPartBytes,
  );
  const partSizeBytes = roundUpToMiB(basePartBytes);
  if (partSizeBytes > maxPartBytes) {
    throw new VideoUploadPolicyError("MULTIPART_LIMIT_EXCEEDED");
  }

  const partCount = Math.ceil(sizeBytes / partSizeBytes);
  if (partCount > maxParts) {
    throw new VideoUploadPolicyError("MULTIPART_LIMIT_EXCEEDED");
  }

  return { mode: "MULTIPART", partSizeBytes, partCount };
}

function roundUpToMiB(value: number): number {
  return Math.ceil(value / mib) * mib;
}

export type VideoUploadPolicyErrorCode =
  | "UNSUPPORTED_MIME"
  | "INVALID_SIZE"
  | "FILE_TOO_LARGE"
  | "MULTIPART_LIMIT_EXCEEDED";

export class VideoUploadPolicyError extends Error {
  constructor(readonly code: VideoUploadPolicyErrorCode) {
    super(code);
    this.name = "VideoUploadPolicyError";
  }
}
