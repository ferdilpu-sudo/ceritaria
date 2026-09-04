interface Props {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-24 w-24 text-2xl",
};

export function CommunityAvatar({ name, avatarUrl, size = "md" }: Props) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`Foto profil ${name}`}
        className={`${sizes[size]} shrink-0 rounded-full border border-[var(--border)] object-cover`}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={`${sizes[size]} grid shrink-0 place-items-center rounded-full bg-zinc-800 font-black`} aria-label={`Avatar ${name}`}>
      {(name || "P").slice(0, 1).toUpperCase()}
    </div>
  );
}
