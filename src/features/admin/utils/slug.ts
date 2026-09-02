export function slugifyAdminTitle(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);
}

export function buildEpisodeSlug(episodeNumber: number, title: string) {
  const titleSlug = slugifyAdminTitle(title);
  return titleSlug ? `episode-${episodeNumber}-${titleSlug}`.slice(0, 160).replace(/-+$/g, "") : `episode-${episodeNumber}`;
}
