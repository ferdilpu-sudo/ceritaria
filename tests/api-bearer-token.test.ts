import { describe, expect, it } from "vitest";
import { parseBearerToken } from "@/lib/security/require-api-admin";

describe("API bearer parsing", () => {
  it("accepts a case-insensitive Bearer scheme", () => {
    expect(parseBearerToken("bearer abc.def.ghi")).toBe("abc.def.ghi");
  });

  it("rejects missing or non-Bearer authorization", () => {
    expect(parseBearerToken(null)).toBeNull();
    expect(parseBearerToken("Basic abc")).toBeNull();
    expect(parseBearerToken("Bearer   ")).toBeNull();
  });
});
