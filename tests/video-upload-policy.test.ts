import { describe, expect, it } from "vitest";
import {
  createVideoUploadPlan,
  validateVideoUploadInput,
  VideoUploadPolicyError,
} from "@/lib/r2/upload-policy";
import type { R2Config } from "@/lib/r2/config";

const mib = 1024 * 1024;

function config(overrides: Partial<R2Config> = {}): R2Config {
  return {
    accountId: "account",
    accessKeyId: "key",
    secretAccessKey: "secret",
    bucket: "videos",
    maxVideoBytes: 5 * 1024 * mib,
    singleUploadThresholdBytes: 100 * mib,
    multipartPartSizeBytes: 16 * mib,
    uploadUrlTtlSeconds: 900,
    uploadSessionTtlSeconds: 86400,
    ...overrides,
  };
}

describe("video upload policy", () => {
  it("uses single PUT at or below the configured threshold", () => {
    expect(createVideoUploadPlan(100 * mib, config())).toEqual({
      mode: "SINGLE",
      partSizeBytes: null,
      partCount: null,
    });
  });

  it("uses multipart above the threshold", () => {
    expect(createVideoUploadPlan(101 * mib, config())).toEqual({
      mode: "MULTIPART",
      partSizeBytes: 16 * mib,
      partCount: 7,
    });
  });

  it("increases part size when needed to stay within ten thousand parts", () => {
    const size = 200 * 1024 * mib;
    const plan = createVideoUploadPlan(
      size,
      config({ maxVideoBytes: size }),
    );
    expect(plan.mode).toBe("MULTIPART");
    if (plan.mode === "MULTIPART") {
      expect(plan.partCount).toBeLessThanOrEqual(10_000);
      expect(plan.partSizeBytes).toBeGreaterThanOrEqual(20 * mib);
    }
  });

  it("rejects non-MP4 uploads and configured oversize files", () => {
    expect(() => validateVideoUploadInput("video/hevc", 10 * mib, config()))
      .toThrowError(VideoUploadPolicyError);
    expect(() => validateVideoUploadInput("video/mp4", 6 * 1024 * mib, config()))
      .toThrowError(VideoUploadPolicyError);
  });
});
