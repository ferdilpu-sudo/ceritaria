import Image from "next/image";

interface MediaImageProps {
  src: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
}

export function MediaImage({ src, alt, priority = false, className = "" }: MediaImageProps) {
  if (!src) {
    return <div className={`grid h-full w-full place-items-center bg-gradient-to-br from-zinc-800 to-zinc-950 text-xs font-bold tracking-widest text-zinc-500 ${className}`}>CERITARIA</div>;
  }
  return <Image src={src} alt={alt} fill sizes="(max-width: 768px) 50vw, 280px" priority={priority} className={`object-cover ${className}`} />;
}
