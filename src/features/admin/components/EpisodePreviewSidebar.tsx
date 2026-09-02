import { AdminPreviewImage } from "@/features/admin/components/AdminPreviewImage";
import type { VideoProvider } from "@/types/database.types";

interface EpisodePreviewSidebarProps {
  provider: VideoProvider;
  thumbnailSrc: string | null;
  title: string;
  episodeNumber: number;
  seriesTitle: string;
  durationSeconds: string;
  published: boolean;
}

export function EpisodePreviewSidebar({
  provider,
  thumbnailSrc,
  title,
  episodeNumber,
  seriesTitle,
  durationSeconds,
  published,
}: EpisodePreviewSidebarProps) {
  return (
    <aside className="min-w-0 max-w-full space-y-4 xl:sticky xl:top-28 xl:self-start">
      <section className="surface min-w-0 rounded-2xl p-4 sm:p-5">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black tracking-[0.16em] text-red-600">PREVIEW</p>
            <h2 className="mt-1 font-black text-[var(--text)]">Card Episode</h2>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${published ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-zinc-200 bg-zinc-100 text-zinc-600"}`}>
            {published ? "PUBLISHED" : "DRAFT"}
          </span>
        </div>

        <div className="mx-auto mt-4 w-full max-w-[220px]">
          <AdminPreviewImage src={thumbnailSrc} alt={`Thumbnail ${title || "episode"}`} aspect="poster" fallback={`EP ${episodeNumber || 1}`} />
        </div>

        <div className="mt-4 min-w-0 space-y-1">
          <p className="break-words font-black text-[var(--text)]">EP {episodeNumber || 1} · {title || "Judul episode"}</p>
          <p className="break-words text-xs leading-5 text-[var(--muted)]">{seriesTitle || "Series belum dipilih"}</p>
          <div className="flex min-w-0 flex-wrap gap-2 pt-2 text-[10px] font-black">
            <span className={`max-w-full truncate rounded-full border px-2 py-1 ${provider === "youtube" ? "border-red-200 bg-red-50 text-red-700" : "border-sky-200 bg-sky-50 text-sky-700"}`}>{provider.toUpperCase()}</span>
            {durationSeconds && <span className="max-w-full truncate rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-[var(--muted)]">{durationSeconds}</span>}
          </div>
        </div>
      </section>
    </aside>
  );
}
