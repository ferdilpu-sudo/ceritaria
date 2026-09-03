export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];
export type MediaKind = "series-cover" | "series-hero" | "episode-thumbnail";

export const MEDIA_KIND_CONFIG: Record<MediaKind, { maxWidth: number; maxHeight: number; prefix: string }> = {
  "series-cover": { maxWidth: 1200, maxHeight: 1800, prefix: "series/cover" },
  "series-hero": { maxWidth: 1920, maxHeight: 1080, prefix: "series/hero" },
  "episode-thumbnail": { maxWidth: 1080, maxHeight: 1920, prefix: "episodes/thumbnail" },
};

const extensions: Record<AllowedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isMediaKind(value: unknown): value is MediaKind {
  return typeof value === "string" && value in MEDIA_KIND_CONFIG;
}

export function isAllowedImageType(value: unknown): value is AllowedImageType {
  return typeof value === "string" && (ALLOWED_IMAGE_TYPES as readonly string[]).includes(value);
}

export function imageExtension(contentType: AllowedImageType) {
  return extensions[contentType];
}

export function validateImageMetadata(contentType: unknown, size: unknown) {
  if (!isAllowedImageType(contentType)) return "Format gambar harus JPG, PNG, atau WebP.";
  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) return "File gambar tidak valid.";
  if (size > MAX_IMAGE_BYTES) return "Ukuran gambar maksimal 5 MB.";
  return null;
}
