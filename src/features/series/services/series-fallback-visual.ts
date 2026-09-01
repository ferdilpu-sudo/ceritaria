export interface SeriesVisualTheme {
  base: string;
  mid: string;
  accent: string;
  accentSoft: string;
  glowX: number;
  glowY: number;
  ridgeShift: number;
}

const palettes = [
  { base: "#07080c", mid: "#241116", accent: "#e50914", accentSoft: "#ff6b74" },
  { base: "#071019", mid: "#10243a", accent: "#2f7df4", accentSoft: "#73a8ff" },
  { base: "#0b0812", mid: "#2a1538", accent: "#9d4edd", accentSoft: "#cf9cff" },
  { base: "#09100b", mid: "#17311e", accent: "#32a852", accentSoft: "#81d996" },
  { base: "#100c08", mid: "#382415", accent: "#e68a28", accentSoft: "#ffc06d" },
] as const;

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getSeriesVisualTheme(seed: string, genres: string[] = []): SeriesVisualTheme {
  const source = `${seed.trim().toLowerCase()}|${genres.join("|").toLowerCase()}`;
  const hash = hashText(source || "ceritaria");
  const palette = palettes[hash % palettes.length];

  return {
    ...palette,
    glowX: 58 + (hash % 29),
    glowY: 12 + ((hash >>> 5) % 28),
    ridgeShift: (hash >>> 9) % 16,
  };
}
