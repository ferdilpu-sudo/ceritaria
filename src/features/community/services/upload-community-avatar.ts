"use client";

import { prepareAdminImage } from "@/features/admin/services/prepare-admin-image";

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

export async function uploadCommunityAvatar(file: File) {
  const prepared = await prepareAdminImage(file, "community-avatar");
  const presign = await fetch("/api/community/avatar/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: prepared.type, size: prepared.size }),
  });

  if (!presign.ok) {
    throw new Error((await readMessage(presign)) || "Foto belum bisa diunggah.");
  }

  const signed = await presign.json() as PresignResponse;
  const upload = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": prepared.type,
      "Cache-Control": signed.cacheControl,
    },
    body: prepared,
  });
  if (!upload.ok) throw new Error("Upload foto belum berhasil. Coba lagi.");
  return signed.publicUrl;
}
