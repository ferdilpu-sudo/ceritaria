import { describe, expect, it } from "vitest";
import { episodeFormSchema, seriesFormSchema } from "@/features/admin/services/schemas";

function episodeInput(videoProvider: "telecloud" | "youtube" | "facebook", videoUrl: string) {
  return {
    seriesId: crypto.randomUUID(), episodeNumber: "1", slug: "episode-1", title: "Episode 1",
    shortSynopsis: "", recap: "", highlights: "", videoProvider, videoUrl, thumbnailUrl: "",
    durationSeconds: "", isPublished: false, seoTitle: "", seoDescription: "",
  };
}

function seriesInput() {
  return {
    slug: "series-uji", title: "Series Uji", shortSynopsis: "", synopsis: "", genres: "Drama",
    coverUrl: "", heroUrl: "", isFeatured: false, isPublished: false, seoTitle: "", seoDescription: "",
  };
}

describe("admin form validation", () => {
  it("rejects invalid series slugs", () => {
    const result = seriesFormSchema.safeParse({ ...seriesInput(), slug: "Tidak Valid" });
    expect(result.success).toBe(false);
  });

  it("validates URLs according to the selected video provider", () => {
    expect(episodeFormSchema.safeParse(episodeInput("youtube", "https://youtu.be/dQw4w9WgXcQ")).success).toBe(true);
    expect(episodeFormSchema.safeParse(episodeInput("youtube", "https://www.facebook.com/example/videos/123456789")).success).toBe(false);
    expect(episodeFormSchema.safeParse(episodeInput("facebook", "https://www.facebook.com/example/videos/123456789")).success).toBe(true);
    expect(episodeFormSchema.safeParse(episodeInput("telecloud", "https://tele.flyonz.web.id/s/25c4dedf-2ad9-4a90-a423-69a8c8f62645")).success).toBe(true);
    expect(episodeFormSchema.safeParse(episodeInput("telecloud", "https://tele.flyonz.web.id/api/files/32/stream")).success).toBe(false);
  });

  it("allows editorial fields to remain empty while content is still a draft", () => {
    expect(seriesFormSchema.safeParse(seriesInput()).success).toBe(true);
    expect(episodeFormSchema.safeParse(episodeInput("telecloud", "https://tele.flyonz.web.id/s/25c4dedf-2ad9-4a90-a423-69a8c8f62645")).success).toBe(true);
  });

  it("rejects thin series content when publishing", () => {
    expect(seriesFormSchema.safeParse({ ...seriesInput(), isPublished: true }).success).toBe(false);
    expect(seriesFormSchema.safeParse({
      ...seriesInput(),
      isPublished: true,
      shortSynopsis: "Seorang perempuan harus memilih antara mempertahankan keluarganya atau mengungkap rahasia yang mengubah hidup mereka.",
      synopsis: "A".repeat(650),
    }).success).toBe(true);
  });

  it("rejects thin episode content when publishing", () => {
    const base = episodeInput("telecloud", "https://tele.flyonz.web.id/s/25c4dedf-2ad9-4a90-a423-69a8c8f62645");
    expect(episodeFormSchema.safeParse({ ...base, isPublished: true }).success).toBe(false);
    expect(episodeFormSchema.safeParse({
      ...base,
      isPublished: true,
      shortSynopsis: "Episode ini mengubah hubungan para tokoh setelah keputusan yang mereka ambil memunculkan konflik baru yang tidak mereka duga.",
      recap: "A".repeat(550),
      highlights: "Konflik utama muncul\nTokoh membuat keputusan penting\nEpisode berakhir dengan masalah baru",
    }).success).toBe(true);
  });
});
