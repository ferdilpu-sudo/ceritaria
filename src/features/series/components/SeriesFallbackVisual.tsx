import { getSeriesVisualTheme } from "@/features/series/services/series-fallback-visual";

interface SeriesFallbackVisualProps {
  seed: string;
  genres?: string[];
  className?: string;
}

export function SeriesFallbackVisual({ seed, genres = [], className = "" }: SeriesFallbackVisualProps) {
  const theme = getSeriesVisualTheme(seed, genres);
  const firstRidge = 58 + theme.ridgeShift;
  const secondRidge = 70 + Math.floor(theme.ridgeShift / 2);

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-black ${className}`}
      style={{
        backgroundImage: [
          `radial-gradient(circle at ${theme.glowX}% ${theme.glowY}%, ${theme.accent}66 0%, transparent 31%)`,
          `radial-gradient(circle at 18% 22%, ${theme.accentSoft}22 0%, transparent 27%)`,
          `linear-gradient(145deg, ${theme.mid} 0%, ${theme.base} 58%, #050507 100%)`,
        ].join(", "),
      }}
    >
      <div
        className="absolute h-28 w-28 rounded-full opacity-70 blur-2xl sm:h-40 sm:w-40"
        style={{
          left: `${Math.max(8, theme.glowX - 22)}%`,
          top: `${Math.max(5, theme.glowY - 2)}%`,
          backgroundColor: theme.accent,
        }}
      />

      <div
        className="absolute inset-x-[-8%] bottom-[15%] h-[34%] opacity-80"
        style={{
          background: `linear-gradient(160deg, transparent 0 18%, ${theme.mid} 18% 48%, #08090d 48% 100%)`,
          clipPath: `polygon(0 ${firstRidge}%, 12% 42%, 27% 66%, 42% 35%, 58% 61%, 72% 39%, 88% 60%, 100% 31%, 100% 100%, 0 100%)`,
        }}
      />

      <div
        className="absolute inset-x-[-6%] bottom-0 h-[31%]"
        style={{
          background: "linear-gradient(180deg, #0b0c11 0%, #050507 100%)",
          clipPath: `polygon(0 ${secondRidge}%, 16% 45%, 31% 64%, 49% 39%, 68% 66%, 84% 48%, 100% 61%, 100% 100%, 0 100%)`,
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.82),transparent_48%,rgba(0,0,0,.12))]" />
      <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:42px_42px]" />
    </div>
  );
}
