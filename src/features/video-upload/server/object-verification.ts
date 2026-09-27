export type UploadedObjectMetadata = {
  sizeBytes: number;
  contentType: string | null;
  etag: string | null;
};

export function verifyUploadedVideoObject(
  expectedSizeBytes: number,
  expectedMimeType: string,
  actual: UploadedObjectMetadata,
): void {
  if (actual.sizeBytes !== expectedSizeBytes) {
    throw new UploadedObjectVerificationError("SIZE_MISMATCH");
  }

  const normalizedMime = actual.contentType
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (normalizedMime !== expectedMimeType.toLowerCase()) {
    throw new UploadedObjectVerificationError("MIME_MISMATCH");
  }
}

export class UploadedObjectVerificationError extends Error {
  constructor(readonly code: "SIZE_MISMATCH" | "MIME_MISMATCH") {
    super(code);
    this.name = "UploadedObjectVerificationError";
  }
}
