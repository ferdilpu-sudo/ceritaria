import { describe, expect, it } from "vitest";
import { buildYouTubeEmbedUrl, getYouTubeVideoId, youtubeVideoUrlSchema } from "@/features/episode/services/youtube-url";

const videoId = "dQw4w9WgXcQ";

describe("youtube URL validation", () => {
  it("accepts watch, short, and shorts URLs", () => {
    expect(youtubeVideoUrlSchema.safeParse(`https://www.youtube.com/watch?v=${videoId}`).success).toBe(true);
    expect(youtubeVideoUrlSchema.safeParse(`https://youtu.be/${videoId}`).success).toBe(true);
    expect(youtubeVideoUrlSchema.safeParse(`https://www.youtube.com/shorts/${videoId}`).success).toBe(true);
  });

  it("rejects non-YouTube hosts and HTTP", () => {
    expect(youtubeVideoUrlSchema.safeParse(`https://example.com/watch?v=${videoId}`).success).toBe(false);
    expect(youtubeVideoUrlSchema.safeParse(`http://youtu.be/${videoId}`).success).toBe(false);
  });

  it("extracts the id and builds privacy-enhanced embed URL", () => {
    expect(getYouTubeVideoId(`https://youtu.be/${videoId}`)).toBe(videoId);
    expect(buildYouTubeEmbedUrl(`https://youtu.be/${videoId}`)).toContain(`youtube-nocookie.com/embed/${videoId}`);
  });
});
