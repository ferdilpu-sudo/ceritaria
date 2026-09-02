"use client";

import Link from "next/link";
import { useRealtimeVisitors } from "@/features/analytics/hooks/useRealtimeVisitors";
import type { AnalyticsReport } from "@/features/analytics/types/analytics";

function Metric({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-[var(--border)] bg-white px-3 py-3 sm:px-4">
      <p className="min-w-0 break-words text-[11px] font-semibold leading-4 text-[var(--muted)] sm:text-xs">{label}</p>
      <p className="mt-1.5 text-2xl font-black leading-none text-[var(--text)]">{value.toLocaleString("id-ID")}</p>
      <p className="mt-1 min-w-0 break-words text-[10px] leading-4 text-[var(--muted)] sm:text-[11px]">{hint}</p>
    </div>
  );
}

export function AnalyticsDashboardSummary({ report }: { report: AnalyticsReport }) {
  const realtime = useRealtimeVisitors();
  const summary = report.summary;

  return (
    <section className="surface min-w-0 rounded-xl p-4 sm:p-5">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
            <p className="text-[10px] font-black tracking-[0.18em] text-emerald-700">REALTIME</p>
          </div>
          <h2 className="mt-1 break-words text-lg font-black text-[var(--text)]">Traffic penonton</h2>
        </div>
        <Link href="/admin/analytics" className="min-h-10 shrink-0 rounded-lg px-2 py-2.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] sm:text-sm">
          Analytics →
        </Link>
      </div>

      <div className="mt-4 grid min-w-0 grid-cols-2 gap-2.5 xl:grid-cols-4">
        <Metric label="Online sekarang" value={realtime.onlineCount} hint="Sesi aktif" />
        <Metric label="Pageview hari ini" value={summary.todayPageviews} hint="Waktu Jakarta" />
        <Metric label="Visitor hari ini" value={summary.todayVisitors} hint="Visitor unik" />
        <Metric label="Visitor 7 hari" value={summary.periodVisitors} hint={`${summary.periodPageviews.toLocaleString("id-ID")} pageview`} />
      </div>
    </section>
  );
}
