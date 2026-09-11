import { describe, expect, it } from "vitest";
import {
  buildTeleCloudShareUrl,
  getTeleCloudStreamUrl,
  normalizeTeleCloudVideoUrl,
  teleCloudVideoUrlSchema,
} from "@/features/episode/services/telecloud-url";

const shareUrl = "https://tele.flyonz.web.id/s/25c4dedf-2ad9-4a90-a423-69a8c8f62645";
const streamUrl = `${shareUrl}/stream`;

describe("TeleCloud URL validation", () => {
  it("accepts public share and stream links", () => {
    expect(teleCloudVideoUrlSchema.safeParse(shareUrl).success).toBe(true);
    expect(teleCloudVideoUrlSchema.safeParse(streamUrl).success).toBe(true);
  });

  it("normalizes a share link to its public stream endpoint", () => {
    expect(getTeleCloudStreamUrl(shareUrl)).toBe(streamUrl);
    expect(normalizeTeleCloudVideoUrl(streamUrl)).toBe(streamUrl);
    expect(buildTeleCloudShareUrl(streamUrl)).toBe(shareUrl);
  });

  it("rejects private file endpoints and other hosts", () => {
    expect(teleCloudVideoUrlSchema.safeParse("https://tele.flyonz.web.id/api/files/32/stream").success).toBe(false);
    expect(teleCloudVideoUrlSchema.safeParse("https://example.com/s/25c4dedf-2ad9-4a90-a423-69a8c8f62645").success).toBe(false);
  });
});
