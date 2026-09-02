import { AdminNav } from "@/components/layout/AdminNav";
import { AdminGuideTour } from "@/features/admin/components/AdminGuideTour";
import { requireAdmin } from "@/lib/security/require-admin";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="admin-theme">
      <AdminNav />
      <main className="shell py-8 sm:py-10">{children}</main>
      <AdminGuideTour />
    </div>
  );
}
