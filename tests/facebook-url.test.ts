import { describe, expect, it } from "vitest";
import {
  facebookPermalinkSchema,
  isFacebookShareUrl,
  normalizeFacebookVideoUrl,
} from "@/features/episode/services/facebook-url";

describe("facebook permalink validation", () => {
  it("accepts the reported Facebook Reel URL", () => {
    const url = "https://www.facebook.com/reel/1588237106186450/";
    expect(facebookPermalinkSchema.safeParse(url).success).toBe(true);
    expect(normalizeFacebookVideoUrl(url)).toBe(url);
  });

  it("normalizes legacy Facebook video permalinks to a canonical Reel URL", () => {
    expect(
      normalizeFacebookVideoUrl("https://www.facebook.com/example/videos/123456789"),
    ).toBe("https://www.facebook.com/reel/123456789/");
  });

  it("recognizes Facebook share URLs for server-side resolution", () => {
    expect(isFacebookShareUrl("https://www.facebook.com/share/r/abc123/")).toBe(true);
    expect(isFacebookShareUrl("https://fb.watch/abc123/")).toBe(true);
  });

  it("rejects non-Facebook hosts", () => {
    expect(facebookPermalinkSchema.safeParse("https://evil.example/reel/123").success).toBe(false);
  });
});
