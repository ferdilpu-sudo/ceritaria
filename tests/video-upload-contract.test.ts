import { describe, expect, it } from "vitest";
import { createVideoUploadRequestSchema } from "@/features/video-upload/server/contracts";
import { buildVideoObjectKey } from "@/features/video-upload/server/object-key";

describe("video upload request contract", () => {
  it("accepts MP4 metadata and normalizes checksum", () => {
    const result = createVideoUploadRequestSchema.parse({
      episodeId: "11111111-1111-4111-8111-111111111111",
      mimeType: "video/mp4",
      sizeBytes: 12_345,
      checksumSha256: "A".repeat(64),
    });

    expect(result.checksumSha256).toBe("a".repeat(64));
  });

  it("rejects unsupported MIME and malformed episode IDs", () => {
    expect(() =>
      createVideoUploadRequestSchema.parse({
        episodeId: "not-a-uuid",
        mimeType: "video/quicktime",
        sizeBytes: 12_345,
      }),
    ).toThrow();
  });

  it("builds a server-controlled canonical object key", () => {
    expect(buildVideoObjectKey("series", "episode", "asset")).toBe(
      "video/series/episode/asset/stream.mp4",
    );
  });
});
