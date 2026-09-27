import { describe, expect, it } from "vitest";
import { authorizeVideoPartRequestSchema } from "@/features/video-upload/server/contracts";
import { expectedMultipartPartSize } from "@/features/video-upload/server/part-layout";

const mib = 1024 * 1024;

describe("multipart part layout", () => {
  it("returns full configured size for non-final parts", () => {
    expect(expectedMultipartPartSize(40 * mib, 16 * mib, 3, 1))
      .toBe(16 * mib);
    expect(expectedMultipartPartSize(40 * mib, 16 * mib, 3, 2))
      .toBe(16 * mib);
  });

  it("returns only remaining bytes for the final part", () => {
    expect(expectedMultipartPartSize(40 * mib, 16 * mib, 3, 3))
      .toBe(8 * mib);
  });

  it("rejects out-of-range part numbers", () => {
    expect(() => expectedMultipartPartSize(40 * mib, 16 * mib, 3, 4))
      .toThrow(RangeError);
    expect(() => authorizeVideoPartRequestSchema.parse({ partNumber: 0 }))
      .toThrow();
  });
});
