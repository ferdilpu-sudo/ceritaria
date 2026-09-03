"use client";

import { prepareAdminImage } from "@/features/admin/services/prepare-admin-image";
import type { MediaKind } from "@/features/admin/services/media-upload-config";

interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  cacheControl: string;
}

async function readMessage(response: Response) {
  try {
    const body = await response.json() as { message?: string };
    return body.message;
  } catch {
    return undefined;
  }
}

export async function uploadAdminImageDirect(file: File, kind: MediaKind) {
  const prepared = await prepareAdminImage(file, kind);
  let presignResponse: Response;
  try {
    presignResponse = await fetch("/api/admin/media/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, contentType: prepared.type, size: prepared.size }),
    });
  } catch {
    throw new Error("Belum bisa menghubungi penyimpanan gambar. Periksa koneksi lalu coba lagi.");
  }

  if (!presignResponse.ok) {
    const message = await readMessage(presignResponse);
    throw new Error(message || "Belum bisa menyiapkan upload gambar. Coba lagi.");
  }

  const signed = await presignResponse.json() as PresignResponse;
  let uploadResponse: Response;
  try {
    uploadResponse = await fetch(signed.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": prepared.type,
        "Cache-Control": signed.cacheControl,
      },
      body: prepared,
    });
  } catch {
    throw new Error("Upload gambar terputus. Periksa koneksi lalu coba lagi.");
  }

  if (!uploadResponse.ok) {
    throw new Error("Upload gambar belum berhasil. Coba lagi beberapa saat.");
  }

  return signed.publicUrl;
}
