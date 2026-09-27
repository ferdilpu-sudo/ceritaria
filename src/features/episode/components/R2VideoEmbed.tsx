interface R2VideoEmbedProps {
  videoUrl: string;
  thumbnailUrl: string | null;
  title: string;
}

export function R2VideoEmbed({
  videoUrl,
  thumbnailUrl,
  title,
}: R2VideoEmbedProps) {
  return (
    <div className="mx-auto w-full max-w-[480px] overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/30">
      <video
        className="aspect-[9/16] w-full bg-black object-contain"
        controls
        playsInline
        preload="metadata"
        poster={thumbnailUrl ?? undefined}
        aria-label={title}
      >
        <source src={videoUrl} type="video/mp4" />
        Browser Anda tidak mendukung pemutar video HTML5.
      </video>
    </div>
  );
}
