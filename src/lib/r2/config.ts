import "server-only";
import { z } from "zod";

const mib = 1024 * 1024;
const gib = 1024 * mib;
const tib = 1024 * gib;
const sevenDaysSeconds = 7 * 24 * 60 * 60;

const r2ConfigSchema = z.object({
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_VIDEO_BUCKET: z.string().min(1),
  R2_MAX_VIDEO_BYTES: z.coerce.number().int().positive().max(5 * tib),
  R2_SINGLE_UPLOAD_THRESHOLD_BYTES: z.coerce
    .number().int().positive().max(5 * gib).default(100 * mib),
  R2_MULTIPART_PART_SIZE_BYTES: z.coerce
    .number().int().min(5 * mib).max(5 * gib).default(16 * mib),
  R2_UPLOAD_URL_TTL_SECONDS: z.coerce
    .number().int().min(1).max(sevenDaysSeconds).default(900),
  R2_PREVIEW_URL_TTL_SECONDS: z.coerce
    .number().int().min(1).max(sevenDaysSeconds).default(900),
  R2_UPLOAD_SESSION_TTL_SECONDS: z.coerce
    .number().int().min(1).max(sevenDaysSeconds).default(86400),
});

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  maxVideoBytes: number;
  singleUploadThresholdBytes: number;
  multipartPartSizeBytes: number;
  uploadUrlTtlSeconds: number;
  previewUrlTtlSeconds: number;
  uploadSessionTtlSeconds: number;
};

export function getR2Config(): R2Config {
  const parsed = r2ConfigSchema.parse({
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_VIDEO_BUCKET: process.env.R2_VIDEO_BUCKET,
    R2_MAX_VIDEO_BYTES: process.env.R2_MAX_VIDEO_BYTES,
    R2_SINGLE_UPLOAD_THRESHOLD_BYTES: process.env.R2_SINGLE_UPLOAD_THRESHOLD_BYTES,
    R2_MULTIPART_PART_SIZE_BYTES: process.env.R2_MULTIPART_PART_SIZE_BYTES,
    R2_UPLOAD_URL_TTL_SECONDS: process.env.R2_UPLOAD_URL_TTL_SECONDS,
    R2_PREVIEW_URL_TTL_SECONDS: process.env.R2_PREVIEW_URL_TTL_SECONDS,
    R2_UPLOAD_SESSION_TTL_SECONDS: process.env.R2_UPLOAD_SESSION_TTL_SECONDS,
  });

  return {
    accountId: parsed.R2_ACCOUNT_ID,
    accessKeyId: parsed.R2_ACCESS_KEY_ID,
    secretAccessKey: parsed.R2_SECRET_ACCESS_KEY,
    bucket: parsed.R2_VIDEO_BUCKET,
    maxVideoBytes: parsed.R2_MAX_VIDEO_BYTES,
    singleUploadThresholdBytes: parsed.R2_SINGLE_UPLOAD_THRESHOLD_BYTES,
    multipartPartSizeBytes: parsed.R2_MULTIPART_PART_SIZE_BYTES,
    uploadUrlTtlSeconds: parsed.R2_UPLOAD_URL_TTL_SECONDS,
    previewUrlTtlSeconds: parsed.R2_PREVIEW_URL_TTL_SECONDS,
    uploadSessionTtlSeconds: parsed.R2_UPLOAD_SESSION_TTL_SECONDS,
  };
}
