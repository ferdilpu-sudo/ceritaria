import { z } from "zod";

const allowedHosts = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "fb.watch",
  "www.fb.watch",
]);

export const facebookPermalinkSchema = z
  .url("URL Facebook tidak valid")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && allowedHosts.has(url.hostname.toLowerCase()) && url.pathname !== "/";
    } catch {
      return false;
    }
  }, "Gunakan link video, Reel, atau link share Facebook Public dengan HTTPS");

export function isFacebookShareUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();

    return (
      host === "fb.watch" ||
      host === "www.fb.watch" ||
      path.startsWith("/share/v/") ||
      path.startsWith("/share/r/") ||
      path.startsWith("/share/p/")
    );
  } catch {
    return false;
  }
}

export function isFacebookWatchUrl(value: string) {
  try {
    const url = new URL(value);
    const path = url.pathname.toLowerCase();
    return (
      (path === "/watch/" || path === "/watch" || path === "/video.php") &&
      Boolean(url.searchParams.get("v"))
    );
  } catch {
    return false;
  }
}

export function normalizeFacebookVideoUrl(value: string) {
  const validUrl = facebookPermalinkSchema.parse(value);
  const url = new URL(validUrl);

  if (isFacebookWatchUrl(validUrl)) {
    const videoId = url.searchParams.get("v")?.trim();
    if (videoId && /^[A-Za-z0-9._-]+$/.test(videoId)) {
      return `https://www.facebook.com/reel/${videoId}/`;
    }
  }

  url.hash = "";
  for (const key of ["mibextid", "rdid", "share_url", "sfnsn", "__cft__", "__tn__"]) {
    url.searchParams.delete(key);
  }
  return url.toString();
}

export function buildFacebookEmbedUrl(permalink: string) {
  const normalizedUrl = normalizeFacebookVideoUrl(permalink);
  const params = new URLSearchParams({ href: normalizedUrl, show_text: "false", width: "480" });
  return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
}
