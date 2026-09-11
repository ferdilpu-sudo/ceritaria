import "server-only";
import { facebookPermalinkSchema, isFacebookShareUrl } from "@/features/episode/services/facebook-url";

const FACEBOOK_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";

function cleanFacebookUrl(value: string) {
  const url = new URL(value);
  url.hash = "";

  for (const key of ["mibextid", "rdid", "share_url", "sfnsn", "__cft__", "__tn__"]) {
    url.searchParams.delete(key);
  }

  return url.toString();
}

function canonicalFromCandidate(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    if (url.protocol !== "https:") return null;

    if (host === "fb.watch" || host === "www.fb.watch") return null;

    if (!["facebook.com", "www.facebook.com", "m.facebook.com"].includes(host)) return null;

    if (url.pathname.startsWith("/login")) {
      const next = url.searchParams.get("next");
      if (!next) return null;
      return canonicalFromCandidate(next);
    }

    if (isFacebookShareUrl(url.toString()) || url.pathname === "/") return null;

    return cleanFacebookUrl(url.toString());
  } catch {
    return null;
  }
}

export async function resolveFacebookVideoUrl(input: string) {
  const validUrl = facebookPermalinkSchema.parse(input);

  if (!isFacebookShareUrl(validUrl)) return cleanFacebookUrl(validUrl);

  let currentUrl = validUrl;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      headers: {
        "User-Agent": FACEBOOK_USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      currentUrl = new URL(location, currentUrl).toString();
      const canonical = canonicalFromCandidate(currentUrl);
      if (canonical) return canonical;
      continue;
    }

    break;
  }

  const followed = await fetch(validUrl, {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
    headers: {
      "User-Agent": FACEBOOK_USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });

  const canonical = canonicalFromCandidate(followed.url);
  if (canonical) return canonical;

  throw new Error("Facebook share URL tidak dapat diubah ke permalink video.");
}
