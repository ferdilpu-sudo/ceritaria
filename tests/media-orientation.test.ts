import { describe, expect, it } from "vitest";
import { getMediaOrientation } from "@/features/episode/services/media-orientation";

describe("getMediaOrientation", () => {
  it("detects portrait media", () => {
    expect(getMediaOrientation(1080, 1920)).toBe("portrait");
  });

  it("detects landscape media", () => {
    expect(getMediaOrientation(1920, 1080)).toBe("landscape");
  });

  it("detects square and near-square media", () => {
    expect(getMediaOrientation(1080, 1080)).toBe("square");
    expect(getMediaOrientation(1000, 960)).toBe("square");
  });

  it("keeps invalid metadata on the portrait-safe fallback", () => {
    expect(getMediaOrientation(0, 0)).toBe("portrait");
    expect(getMediaOrientation(Number.NaN, 1080)).toBe("portrait");
  });
});
