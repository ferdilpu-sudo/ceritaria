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

export function buildFacebookEmbedUrl(permalink: string) {
  const validUrl = facebookPermalinkSchema.parse(permalink);
  const params = new URLSearchParams({ href: validUrl, show_text: "false", width: "480" });
  return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
}
