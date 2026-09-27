export function expectedMultipartPartSize(
  totalBytes: number,
  partSizeBytes: number,
  partCount: number,
  partNumber: number,
): number {
  if (
    partNumber < 1 ||
    partNumber > partCount ||
    partCount < 1 ||
    partSizeBytes < 1 ||
    totalBytes < 1
  ) {
    throw new RangeError("Invalid multipart layout");
  }

  if (partNumber < partCount) return partSizeBytes;
  return totalBytes - partSizeBytes * (partCount - 1);
}
