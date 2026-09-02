import { AdminFormHeader } from "@/features/admin/components/AdminFormHeader";
import { SeriesForm } from "@/features/admin/components/SeriesForm";

export default function NewSeriesPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <AdminFormHeader
        eyebrow="SERIES"
        title="Series Baru"
        description="Isi informasi utama, upload cover/hero, lalu simpan sebagai draft atau publish."
        backHref="/admin/series"
        backLabel="Daftar Series"
      />
      <SeriesForm />
    </div>
  );
}
