import { z } from "zod";

const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;

function normalizeHost(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function isYouTubeHost(hostname: string) {
  const host = normalizeHost(hostname);
  return host === "youtube.com" || host.endsWith(".youtube.com") ||
    host === "youtube-nocookie.com" || host.endsWith(".youtube-nocookie.com");
}

export function getYouTubeVideoId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = normalizeHost(url.hostname);

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && videoIdPattern.test(id) ? id : null;
    }
    if (!isYouTubeHost(host)) return null;

    const segments = url.pathname.split("/").filter(Boolean);
    let id = url.searchParams.get("v");
    if (!id && ["shorts", "embed", "live", "v"].includes(segments[0] ?? "")) {
      id = segments[1] ?? null;
    }
    return id && videoIdPattern.test(id) ? id : null;
  } catch {
    return null;
  }
}

export const youtubeVideoUrlSchema = z.string().trim().refine(
  (value) => getYouTubeVideoId(value) !== null,
  "Gunakan URL video YouTube HTTPS yang valid",
);

export function buildYouTubeEmbedUrl(videoUrl: string, autoplay = false) {
  const id = getYouTubeVideoId(videoUrl);
  if (!id) throw new Error("URL YouTube tidak valid");
  const params = new URLSearchParams({ playsinline: "1", rel: "0" });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
