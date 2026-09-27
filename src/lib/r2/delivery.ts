import "server-only";
import { z } from "zod";

const deliveryConfigSchema = z.object({
  R2_VIDEO_PUBLIC_BASE_URL: z
    .url()
    .transform((value) => value.replace(/\/+$/, "")),
});

export function buildR2VideoUrl(objectKey: string): string {
  const { R2_VIDEO_PUBLIC_BASE_URL } = deliveryConfigSchema.parse({
    R2_VIDEO_PUBLIC_BASE_URL: process.env.R2_VIDEO_PUBLIC_BASE_URL,
  });
  const encodedPath = objectKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return R2_VIDEO_PUBLIC_BASE_URL + "/" + encodedPath;
}
