import { z } from "zod";

export const createVideoUploadRequestSchema = z.object({
  episodeId: z.uuid(),
  mimeType: z.literal("video/mp4"),
  sizeBytes: z.number().int().positive(),
  checksumSha256: z.string().regex(/^[0-9a-fA-F]{64}$/).transform((value) => value.toLowerCase()).optional(),
});

export type CreateVideoUploadRequest = z.infer<typeof createVideoUploadRequestSchema>;

export type CreateVideoUploadResponse = {
  assetId: string;
  sessionId: string;
  expiresAt: string;
  upload:
    | {
        mode: "SINGLE";
        url: string;
        headers: { "Content-Type": "video/mp4" };
      }
    | {
        mode: "MULTIPART";
        partSizeBytes: number;
        partCount: number;
      };
};

export const authorizeVideoPartRequestSchema = z.object({
  partNumber: z.number().int().min(1).max(10_000),
});

export type AuthorizeVideoPartRequest =
  z.infer<typeof authorizeVideoPartRequestSchema>;

export type AuthorizeVideoPartResponse = {
  partNumber: number;
  sizeBytes: number;
  url: string;
};

const completedPartSchema = z.object({
  partNumber: z.number().int().min(1).max(10_000),
  etag: z.string().min(1).max(256),
});

export const completeVideoUploadRequestSchema = z.object({
  parts: z.array(completedPartSchema).min(1).max(10_000),
});

export type CompleteVideoUploadRequest =
  z.infer<typeof completeVideoUploadRequestSchema>;

export type CompleteVideoUploadResponse = {
  status: "UPLOADED";
};

export type FinalizeVideoUploadResponse = {
  assetId: string;
  status: "READY";
  sizeBytes: number;
  etag: string | null;
};

export type CancelVideoUploadResponse = {
  status: "CANCELLED";
};

export type VideoUploadStatusResponse = {
  sessionId: string;
  assetId: string;
  mode: "SINGLE" | "MULTIPART";
  sessionStatus: string;
  assetStatus: string;
  expiresAt: string;
  expired: boolean;
  expectedSizeBytes: number;
  actualSizeBytes: number | null;
  partSizeBytes: number | null;
  partCount: number | null;
};

export const attachVideoAssetParamsSchema = z.object({
  episodeId: z.uuid(),
  assetId: z.uuid(),
});

export type AttachVideoAssetResponse = {
  episodeId: string;
  assetId: string;
  status: "ATTACHED";
  replacedAssetId: string | null;
};
