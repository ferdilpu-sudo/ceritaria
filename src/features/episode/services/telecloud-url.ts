import { z } from "zod";

const teleCloudHost = "tele.flyonz.web.id";
const sharePathPattern = /^\/s\/([A-Za-z0-9_-]{8,128})(?:\/stream(?:\/[^/?#]+)?)?\/?$/;

function getShareToken(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== teleCloudHost) return null;
    return url.pathname.match(sharePathPattern)?.[1] ?? null;
  } catch {
    return null;
  }
}

export const teleCloudVideoUrlSchema = z.string().trim().refine(
  (value) => getShareToken(value) !== null,
  "Gunakan link share publik TeleCloud HTTPS yang berbentuk /s/...",
);

export function getTeleCloudStreamUrl(value: string): string | null {
  const token = getShareToken(value);
  return token ? `https://${teleCloudHost}/s/${token}/stream` : null;
}

export function normalizeTeleCloudVideoUrl(value: string) {
  const streamUrl = getTeleCloudStreamUrl(value);
  if (!streamUrl) throw new Error("URL TeleCloud tidak valid");
  return streamUrl;
}

export function buildTeleCloudShareUrl(value: string) {
  const streamUrl = normalizeTeleCloudVideoUrl(value);
  const url = new URL(streamUrl);
  const token = url.pathname.split("/").filter(Boolean)[1];
  return `${url.origin}/s/${token}`;
}
