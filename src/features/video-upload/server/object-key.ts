export function buildVideoObjectKey(
  seriesId: string,
  episodeId: string,
  assetId: string,
): string {
  return `video/${seriesId}/${episodeId}/${assetId}/stream.mp4`;
}
