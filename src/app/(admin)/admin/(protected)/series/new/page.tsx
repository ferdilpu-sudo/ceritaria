import { AdminFormHeader } from "@/features/admin/components/AdminFormHeader";
import { SeriesForm } from "@/features/admin/components/SeriesForm";

export default function NewSeriesPage() {
  return (
    <div className="relative left-1/2 w-[min(calc(100vw-40px),1400px)] -translate-x-1/2">
      <AdminFormHeader
        eyebrow="SERIES"
        title="Series Baru"
        description="Buat series baru, siapkan cover dan hero, lalu simpan sebagai draft atau langsung publikasikan."
        backHref="/admin/series"
        backLabel="Daftar Series"
      />
      <SeriesForm />
    </div>
  );
}
