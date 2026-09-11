import { describe, expect, it } from "vitest";
import { episodeFormSchema, seriesFormSchema } from "@/features/admin/services/schemas";

function episodeInput(videoProvider: "telecloud" | "youtube" | "facebook", videoUrl: string) {
  return {
    seriesId: crypto.randomUUID(), episodeNumber: "1", slug: "episode-1", title: "Episode 1",
    shortSynopsis: "", recap: "", highlights: "", videoProvider, videoUrl, thumbnailUrl: "",
    durationSeconds: "", isPublished: false, seoTitle: "", seoDescription: "",
  };
}

describe("admin form validation", () => {
  it("rejects invalid series slugs", () => {
    const result = seriesFormSchema.safeParse({ slug: "Tidak Valid", title: "Series", shortSynopsis: "", synopsis: "", genres: "Drama", coverUrl: "", heroUrl: "", isFeatured: false, isPublished: false, seoTitle: "", seoDescription: "" });
    expect(result.success).toBe(false);
  });

  it("validates URLs according to the selected video provider", () => {
    expect(episodeFormSchema.safeParse(episodeInput("youtube", "https://youtu.be/dQw4w9WgXcQ")).success).toBe(true);
    expect(episodeFormSchema.safeParse(episodeInput("youtube", "https://www.facebook.com/example/videos/123456789")).success).toBe(false);
    expect(episodeFormSchema.safeParse(episodeInput("facebook", "https://www.facebook.com/example/videos/123456789")).success).toBe(true);
    expect(episodeFormSchema.safeParse(episodeInput("telecloud", "https://tele.flyonz.web.id/s/25c4dedf-2ad9-4a90-a423-69a8c8f62645")).success).toBe(true);
    expect(episodeFormSchema.safeParse(episodeInput("telecloud", "https://tele.flyonz.web.id/api/files/32/stream")).success).toBe(false);
  });
});
