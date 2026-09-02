import { AnalyticsReportView } from "@/features/analytics/components/AnalyticsReportView";
import { getAnalyticsReport } from "@/features/analytics/services/admin-analytics";

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const params = await searchParams;
  const days = Number(params.days ?? 7);
  const report = await getAnalyticsReport(days);
  return <AnalyticsReportView report={report} />;
}
