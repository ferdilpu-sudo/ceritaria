import { AdminPreviewImage } from "@/features/admin/components/AdminPreviewImage";
import { VideoPreview } from "@/features/admin/components/VideoPreview";
import type { VideoProvider } from "@/types/database.types";

interface EpisodePreviewSidebarProps {
  provider: VideoProvider;
  videoUrl: string;
  thumbnailSrc: string | null;
  title: string;
  episodeNumber: number;
  seriesTitle: string;
  durationSeconds: string;
  published: boolean;
}

export function EpisodePreviewSidebar({
  provider,
  videoUrl,
  thumbnailSrc,
  title,
  episodeNumber,
  seriesTitle,
  durationSeconds,
  published,
}: EpisodePreviewSidebarProps) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
      <VideoPreview provider={provider} videoUrl={videoUrl} />

      <section className="surface rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black tracking-[0.16em] text-red-600">EPISODE</p>
            <h2 className="mt-1 font-black text-[var(--text)]">Thumbnail</h2>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${published ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-zinc-200 bg-zinc-100 text-zinc-600"}`}>
            {published ? "PUBLISHED" : "DRAFT"}
          </span>
        </div>

        <div className="mx-auto mt-4 max-w-[220px]">
          <AdminPreviewImage src={thumbnailSrc} alt={`Thumbnail ${title || "episode"}`} aspect="poster" fallback={`EP ${episodeNumber || 1}`} />
        </div>

        <div className="mt-4 space-y-1">
          <p className="font-black text-[var(--text)]">EP {episodeNumber || 1} · {title || "Judul episode"}</p>
          <p className="text-xs text-[var(--muted)]">{seriesTitle || "Series belum dipilih"}</p>
          <div className="flex flex-wrap gap-2 pt-2 text-[10px] font-black">
            <span className={`rounded-full border px-2 py-1 ${provider === "youtube" ? "border-red-200 bg-red-50 text-red-700" : "border-sky-200 bg-sky-50 text-sky-700"}`}>{provider.toUpperCase()}</span>
            {durationSeconds && <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-[var(--muted)]">{durationSeconds}s</span>}
          </div>
        </div>
      </section>
    </aside>
  );
}
