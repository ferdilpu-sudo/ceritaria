import { z } from "zod";

const allowedHosts = new Set(["facebook.com", "www.facebook.com", "m.facebook.com"]);

export function isFacebookUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && allowedHosts.has(url.hostname.toLowerCase()) && url.pathname !== "/";
  } catch {
    return false;
  }
}

export const facebookPermalinkSchema = z
  .url("URL Facebook tidak valid")
  .refine(isFacebookUrl, "Gunakan permalink video Facebook Public dengan HTTPS");

export function buildFacebookEmbedUrl(permalink: string) {
  const validUrl = facebookPermalinkSchema.parse(permalink);
  const params = new URLSearchParams({ href: validUrl, show_text: "false", width: "480" });
  return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
}
