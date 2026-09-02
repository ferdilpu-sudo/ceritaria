"use client";

import Link from "next/link";
import { useRealtimeVisitors } from "@/features/analytics/hooks/useRealtimeVisitors";
import type { AnalyticsReport } from "@/features/analytics/types/analytics";

function Metric({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-black text-[var(--text)]">{value.toLocaleString("id-ID")}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>
    </div>
  );
}

export function AnalyticsDashboardSummary({ report }: { report: AnalyticsReport }) {
  const realtime = useRealtimeVisitors();
  const summary = report.summary;

  return (
    <section className="surface rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            <p className="text-[11px] font-black tracking-[0.18em] text-emerald-700">REALTIME</p>
          </div>
          <h2 className="mt-1 text-xl font-black text-[var(--text)]">Traffic penonton</h2>
        </div>
        <Link href="/admin/analytics" className="min-h-11 rounded-xl px-2 py-3 text-sm font-bold text-[var(--muted)] hover:text-[var(--text)]">
          Buka Analytics →
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Online sekarang" value={realtime.onlineCount} hint="Sesi aktif realtime" />
        <Metric label="Pageview hari ini" value={summary.todayPageviews} hint="Waktu Jakarta" />
        <Metric label="Visitor hari ini" value={summary.todayVisitors} hint="Visitor anonim unik" />
        <Metric label="Visitor 7 hari" value={summary.periodVisitors} hint={`${summary.periodPageviews.toLocaleString("id-ID")} pageview`} />
      </div>
    </section>
  );
}
