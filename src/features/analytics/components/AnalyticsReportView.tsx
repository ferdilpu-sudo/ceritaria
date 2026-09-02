import Link from "next/link";
import type { AnalyticsPoint, AnalyticsReport } from "@/features/analytics/types/analytics";
import { RealtimeVisitorsPanel } from "@/features/analytics/components/RealtimeVisitorsPanel";

function number(value: number) { return value.toLocaleString("id-ID"); }

function MiniList({ title, items }: { title: string; items: AnalyticsPoint[] }) {
  return (
    <section className="surface min-w-0 rounded-2xl p-4 sm:p-6">
      <h2 className="break-words font-black text-[var(--text)]">{title}</h2>
      <div className="mt-4 min-w-0 space-y-3">
        {items.slice(0, 7).map((item) => (
          <div key={item.label} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
            <span className="min-w-0 truncate capitalize text-[var(--text)]">{item.label}</span>
            <span className="font-bold text-[var(--muted)]">{number(item.value)}</span>
          </div>
        ))}
        {!items.length && <p className="text-sm text-[var(--muted)]">Belum ada data.</p>}
      </div>
    </section>
  );
}

export function AnalyticsReportView({ report }: { report: AnalyticsReport }) {
  const maxHourly = Math.max(1, ...report.hourly.map((item) => item.value));
  const s = report.summary;

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black tracking-[0.18em] text-red-600">ANALYTICS</p>
          <h1 className="mt-2 break-words text-3xl font-black text-[var(--text)] sm:text-4xl">Audience Ceritaria</h1>
          <p className="mt-2 break-words text-sm leading-5 text-[var(--muted)]">First-party analytics anonim. Tanpa menyimpan IP atau user-agent lengkap.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          {[7, 30, 90].map((days) => (
            <Link key={days} href={`/admin/analytics?days=${days}`} className={`min-w-0 rounded-xl border px-3 py-2 text-center text-sm font-bold ${report.days === days ? "border-red-200 bg-red-50 text-red-700" : "border-[var(--border)] bg-white text-[var(--muted)]"}`}>
              {days} hari
            </Link>
          ))}
        </div>
      </div>

      <RealtimeVisitorsPanel />

      <section className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          ["Pageview hari ini", s.todayPageviews, "Asia/Jakarta"],
          ["Visitor hari ini", s.todayVisitors, "Anonim unik"],
          [`Pageview ${report.days} hari`, s.periodPageviews, `${number(s.periodSessions)} session`],
          [`Visitor ${report.days} hari`, s.periodVisitors, `${number(s.totalEvents)} total event`],
        ].map(([label, value, hint]) => (
          <article key={String(label)} className="surface min-w-0 rounded-xl p-3.5 sm:rounded-2xl sm:p-5">
            <p className="break-words text-[11px] font-semibold leading-4 text-[var(--muted)] sm:text-sm">{label}</p>
            <p className="mt-2 text-2xl font-black leading-none text-[var(--text)] sm:text-3xl">{number(Number(value))}</p>
            <p className="mt-1 break-words text-[10px] leading-4 text-[var(--muted)] sm:text-xs">{hint}</p>
          </article>
        ))}
      </section>

      <section className="surface min-w-0 rounded-2xl p-4 sm:p-6">
        <div className="flex min-w-0 items-end justify-between gap-4">
          <div className="min-w-0"><p className="text-[11px] font-black tracking-[0.18em] text-red-600">24 JAM</p><h2 className="mt-1 break-words text-xl font-black text-[var(--text)]">Aktivitas pageview</h2></div>
          <p className="shrink-0 text-xs text-[var(--muted)]">per jam</p>
        </div>
        <div className="mt-6 flex h-36 min-w-0 items-end gap-1">
          {report.hourly.map((item) => (
            <div key={item.label} title={`${item.label}: ${item.value}`} className="min-w-0 flex-1 rounded-t bg-red-500/80" style={{ height: `${Math.max(4, (item.value / maxHourly) * 100)}%` }} />
          ))}
          {!report.hourly.length && <p className="self-center text-sm text-[var(--muted)]">Belum ada pageview dalam 24 jam terakhir.</p>}
        </div>
      </section>

      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <section className="surface min-w-0 rounded-2xl p-4 sm:p-6">
          <h2 className="font-black text-[var(--text)]">Halaman teratas</h2>
          <div className="mt-4 min-w-0 divide-y divide-[var(--border)]">
            {report.topPages.map((item) => (
              <div key={item.path} className="grid min-w-0 gap-1 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                <span className="min-w-0 truncate text-[var(--text)]">{item.path}</span>
                <span className="break-words text-xs font-bold text-[var(--muted)] sm:text-sm">{number(item.views)} views · {number(item.visitors)} visitor</span>
              </div>
            ))}
            {!report.topPages.length && <p className="py-4 text-sm text-[var(--muted)]">Belum ada data.</p>}
          </div>
        </section>
        <div className="grid min-w-0 gap-5 sm:grid-cols-2"><MiniList title="Device" items={report.devices} /><MiniList title="Referrer" items={report.referrers} /></div>
      </div>

      <MiniList title="Event penonton" items={report.events} />
    </div>
  );
}
