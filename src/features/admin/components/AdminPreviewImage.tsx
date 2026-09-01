interface AdminPreviewImageProps {
  src: string | null;
  alt: string;
  aspect: "poster" | "hero";
  fallback: string;
}

export function AdminPreviewImage({ src, alt, aspect, fallback }: AdminPreviewImageProps) {
  const aspectClass = aspect === "poster" ? "aspect-[2/3]" : "aspect-video";

  return (
    <div
      role={src ? "img" : undefined}
      aria-label={src ? alt : undefined}
      className={`${aspectClass} relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200 bg-cover bg-center`}
      style={src ? { backgroundImage: `url(${JSON.stringify(src)})` } : undefined}
    >
      {!src && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-xs font-black tracking-[0.18em] text-zinc-400">{fallback}</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
    </div>
  );
}
