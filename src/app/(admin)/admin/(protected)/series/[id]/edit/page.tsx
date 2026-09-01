import { notFound } from "next/navigation";
import { AdminFormHeader } from "@/features/admin/components/AdminFormHeader";
import { SeriesForm } from "@/features/admin/components/SeriesForm";
import { getAdminSeriesById } from "@/features/admin/services/admin-content";

export default async function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await getAdminSeriesById(id);
  if (!series) notFound();

  return (
    <div className="relative left-1/2 w-[min(calc(100vw-40px),1400px)] -translate-x-1/2">
      <AdminFormHeader
        eyebrow="SERIES"
        title="Edit Series"
        description={`Perbarui informasi, media, SEO, dan status publikasi ${series.title}.`}
        backHref="/admin/series"
        backLabel="Daftar Series"
      />
      <SeriesForm initial={series} />
    </div>
  );
}
