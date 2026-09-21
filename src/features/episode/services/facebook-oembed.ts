import "server-only";
import {
  facebookPermalinkSchema,
  type FacebookEmbedStatus,
} from "@/features/episode/services/facebook-url";

const FACEBOOK_OEMBED_ENDPOINT = "https://graph.facebook.com/v25.0/oembed_video";

interface FacebookOEmbedResponse {
  html?: unknown;
}

export async function getFacebookEmbedStatus(permalink: string): Promise<FacebookEmbedStatus> {
  const validUrl = facebookPermalinkSchema.parse(permalink);
  const endpoint = new URL(FACEBOOK_OEMBED_ENDPOINT);
  endpoint.searchParams.set("url", validUrl);
  endpoint.searchParams.set("omitscript", "true");
  endpoint.searchParams.set("maxwidth", "480");

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const payload = (await response.json()) as FacebookOEmbedResponse;
      return typeof payload.html === "string" && payload.html.trim().length > 0
        ? "available"
        : "unknown";
    }

    if (response.status === 400 || response.status === 404) {
      return "unavailable";
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}
