import type { CompleteVideoUploadRequest } from "@/features/video-upload/server/contracts";

export type NormalizedCompletedPart = {
  PartNumber: number;
  ETag: string;
};

export function normalizeCompletedParts(
  input: CompleteVideoUploadRequest,
  expectedCount: number,
): NormalizedCompletedPart[] {
  if (input.parts.length !== expectedCount) {
    throw new CompletedPartsError("PART_COUNT_MISMATCH");
  }

  const sorted = [...input.parts].sort(
    (left, right) => left.partNumber - right.partNumber,
  );
  for (let index = 0; index < sorted.length; index += 1) {
    if (sorted[index].partNumber !== index + 1) {
      throw new CompletedPartsError("PART_SEQUENCE_INVALID");
    }
  }

  return sorted.map((part) => ({
    PartNumber: part.partNumber,
    ETag: part.etag,
  }));
}

export class CompletedPartsError extends Error {
  constructor(readonly code: "PART_COUNT_MISMATCH" | "PART_SEQUENCE_INVALID") {
    super(code);
    this.name = "CompletedPartsError";
  }
}
