import { describe, expect, it } from "vitest";
import {
  facebookPermalinkSchema,
  getFacebookVideoKind,
} from "@/features/episode/services/facebook-url";

describe("facebook permalink validation", () => {
  it("accepts Facebook reel permalinks", () => {
    const url = "https://www.facebook.com/reel/1588237106186450/";
    expect(facebookPermalinkSchema.safeParse(url).success).toBe(true);
    expect(getFacebookVideoKind(url)).toBe("reel");
  });

  it("accepts legacy Facebook video permalinks", () => {
    const url = "https://www.facebook.com/example/videos/123456789";
    expect(facebookPermalinkSchema.safeParse(url).success).toBe(true);
    expect(getFacebookVideoKind(url)).toBe("video");
  });

  it("accepts Facebook watch and video.php URLs with a video id", () => {
    expect(facebookPermalinkSchema.safeParse("https://www.facebook.com/watch/?v=123456789").success).toBe(true);
    expect(facebookPermalinkSchema.safeParse("https://www.facebook.com/video.php?v=123456789").success).toBe(true);
  });

  it("rejects Facebook pages that are not supported video permalinks", () => {
    expect(facebookPermalinkSchema.safeParse("https://www.facebook.com/example").success).toBe(false);
    expect(facebookPermalinkSchema.safeParse("https://www.facebook.com/groups/123456789").success).toBe(false);
    expect(facebookPermalinkSchema.safeParse("https://www.facebook.com/example/posts/123456789").success).toBe(false);
  });

  it("rejects non-Facebook hosts", () => {
    expect(facebookPermalinkSchema.safeParse("https://evil.example/reel/123").success).toBe(false);
  });
});
