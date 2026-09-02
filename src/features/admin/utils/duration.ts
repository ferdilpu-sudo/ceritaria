export function secondsToClock(value?: number | null) {
  if (!value || value <= 0) return "";
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
