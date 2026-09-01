import { notFound } from "next/navigation";
import { AdminFormHeader } from "@/features/admin/components/AdminFormHeader";
import { EpisodeForm } from "@/features/admin/components/EpisodeForm";
import { getAdminEpisodeById, getAdminSeries } from "@/features/admin/services/admin-content";

export default async function EditEpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [episode, series] = await Promise.all([getAdminEpisodeById(id), getAdminSeries()]);
  if (!episode) notFound();

  return (
    <div className="relative left-1/2 w-[min(calc(100vw-40px),1400px)] -translate-x-1/2">
      <AdminFormHeader
        eyebrow="EPISODE"
        title="Edit Episode"
        description={`Perbarui video, thumbnail, editorial, SEO, dan status publikasi ${episode.title}.`}
        backHref="/admin/episodes"
        backLabel="Daftar Episode"
      />
      <EpisodeForm series={series} initial={episode} />
    </div>
  );
}
