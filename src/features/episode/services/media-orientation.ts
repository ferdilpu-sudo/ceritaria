export type MediaOrientation = "portrait" | "landscape" | "square";

const SQUARE_TOLERANCE = 0.05;

export function getMediaOrientation(width: number, height: number): MediaOrientation {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return "portrait";
  }

  const ratio = width / height;
  if (Math.abs(1 - ratio) <= SQUARE_TOLERANCE) return "square";
  return ratio > 1 ? "landscape" : "portrait";
}
