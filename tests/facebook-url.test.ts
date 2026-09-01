import { describe, expect, it } from "vitest";
import { buildFacebookEmbedUrl, facebookPermalinkSchema } from "@/features/episode/services/facebook-url";

describe("facebook permalink validation", () => {
  it("accepts public Facebook HTTPS links", () => {
    expect(facebookPermalinkSchema.safeParse("https://www.facebook.com/example/videos/123456789").success).toBe(true);
  });
  it("rejects non-Facebook hosts", () => {
    expect(facebookPermalinkSchema.safeParse("https://evil.example/video/123").success).toBe(false);
  });
  it("builds the official plugins/video.php iframe URL", () => {
    const embed = buildFacebookEmbedUrl("https://www.facebook.com/example/videos/123456789");
    expect(embed).toContain("facebook.com/plugins/video.php");
    expect(embed).toContain("href=");
  });
});
