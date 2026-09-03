"use client";

import { MAX_IMAGE_BYTES, MEDIA_KIND_CONFIG, validateImageMetadata, type MediaKind } from "@/features/admin/services/media-upload-config";

const WEBP_QUALITY = 0.82;

function webpName(name: string) {
  return `${name.replace(/\.[^.]+$/, "") || "ceritaria"}.webp`;
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
}

export async function prepareAdminImage(file: File, kind: MediaKind) {
  const validation = validateImageMetadata(file.type, file.size);
  if (validation) throw new Error(validation);
  if (typeof createImageBitmap !== "function") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { maxWidth, maxHeight } = MEDIA_KIND_CONFIG[kind];
    const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const resized = width !== bitmap.width || height !== bitmap.height;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await canvasToBlob(canvas);
    if (!blob || (blob.size > file.size && !resized)) return file;
    if (blob.size > MAX_IMAGE_BYTES) throw new Error("Gambar masih terlalu besar setelah dioptimalkan.");

    return new File([blob], webpName(file.name), { type: "image/webp", lastModified: Date.now() });
  } catch (error) {
    if (error instanceof Error && error.message.includes("terlalu besar")) throw error;
    return file;
  }
}
