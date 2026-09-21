import { z } from "zod";

const allowedHosts = new Set(["facebook.com", "www.facebook.com", "m.facebook.com"]);

export type FacebookVideoKind = "reel" | "video";
export type FacebookEmbedStatus = "available" | "unavailable" | "unknown";

function getFacebookVideoKindFromUrl(url: URL): FacebookVideoKind | null {
  const pathname = url.pathname.replace(/\/{2,}/g, "/");

  if (/^\/reel\/[^/]+\/?$/i.test(pathname)) return "reel";
  if (/^\/[^/]+\/videos\/[^/]+\/?$/i.test(pathname)) return "video";

  if (/^\/watch\/?$/i.test(pathname) && url.searchParams.get("v")) return "video";
  if (/^\/video\.php$/i.test(pathname) && url.searchParams.get("v")) return "video";

  return null;
}

function isSupportedFacebookVideoUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      allowedHosts.has(url.hostname.toLowerCase()) &&
      getFacebookVideoKindFromUrl(url) !== null
    );
  } catch {
    return false;
  }
}

export const facebookPermalinkSchema = z
  .url("URL Facebook tidak valid")
  .refine(
    isSupportedFacebookVideoUrl,
    "Gunakan permalink Reel atau video Facebook Public dengan HTTPS",
  );

export function getFacebookVideoKind(permalink: string): FacebookVideoKind {
  const validUrl = facebookPermalinkSchema.parse(permalink);
  const kind = getFacebookVideoKindFromUrl(new URL(validUrl));

  if (!kind) {
    throw new Error("URL Facebook bukan permalink video yang didukung");
  }

  return kind;
}
