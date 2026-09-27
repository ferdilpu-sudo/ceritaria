import { describe, expect, it } from "vitest";
import { completeVideoUploadRequestSchema } from "@/features/video-upload/server/contracts";
import {
  CompletedPartsError,
  normalizeCompletedParts,
} from "@/features/video-upload/server/completed-parts";
import {
  UploadedObjectVerificationError,
  verifyUploadedVideoObject,
} from "@/features/video-upload/server/object-verification";

describe("video upload completion contract", () => {
  it("sorts a complete multipart ETag set", () => {
    const input = completeVideoUploadRequestSchema.parse({
      parts: [
        { partNumber: 2, etag: '"two"' },
        { partNumber: 1, etag: '"one"' },
      ],
    });

    expect(normalizeCompletedParts(input, 2)).toEqual([
      { PartNumber: 1, ETag: '"one"' },
      { PartNumber: 2, ETag: '"two"' },
    ]);
  });

  it("rejects missing or duplicate part numbers", () => {
    const input = completeVideoUploadRequestSchema.parse({
      parts: [
        { partNumber: 1, etag: "one" },
        { partNumber: 1, etag: "again" },
      ],
    });

    expect(() => normalizeCompletedParts(input, 2))
      .toThrowError(CompletedPartsError);
  });

  it("accepts matching MP4 HEAD metadata", () => {
    expect(() =>
      verifyUploadedVideoObject(100, "video/mp4", {
        sizeBytes: 100,
        contentType: "video/mp4; charset=binary",
        etag: '"etag"',
      }),
    ).not.toThrow();
  });

  it("rejects size and MIME mismatches", () => {
    expect(() =>
      verifyUploadedVideoObject(100, "video/mp4", {
        sizeBytes: 99,
        contentType: "video/mp4",
        etag: null,
      }),
    ).toThrowError(UploadedObjectVerificationError);

    expect(() =>
      verifyUploadedVideoObject(100, "video/mp4", {
        sizeBytes: 100,
        contentType: "application/octet-stream",
        etag: null,
      }),
    ).toThrowError(UploadedObjectVerificationError);
  });
});
