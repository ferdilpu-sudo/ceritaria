"use client";

import { useRealtimeVisitors } from "@/features/analytics/hooks/useRealtimeVisitors";

export function RealtimeVisitorsPanel() {
  const realtime = useRealtimeVisitors();

  return (
    <section className="surface min-w-0 rounded-2xl p-4 sm:p-6">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-emerald-500" />
            <p className="text-[11px] font-black tracking-[0.18em] text-emerald-700">LIVE</p>
          </div>
          <h2 className="mt-1 break-words text-xl font-black text-[var(--text)]">Visitor realtime</h2>
          <p className="mt-1 break-words text-xs leading-5 text-[var(--muted)]">Perkiraan dari sesi browser yang sedang terhubung.</p>
        </div>
        <p className="shrink-0 text-3xl font-black text-[var(--text)] sm:text-4xl">{realtime.onlineCount}</p>
      </div>

      <div className="mt-5 grid min-w-0 gap-5 md:grid-cols-2">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">Sedang membuka</p>
          <div className="mt-3 min-w-0 space-y-2">
            {realtime.paths.slice(0, 5).map((item) => (
              <div key={item.label} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
                <span className="truncate text-[var(--text)]">{item.label}</span>
                <span className="font-bold text-[var(--muted)]">{item.value}</span>
              </div>
            ))}
            {!realtime.paths.length && <p className="text-sm text-[var(--muted)]">Belum ada visitor online.</p>}
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">Device online</p>
          <div className="mt-3 min-w-0 space-y-2">
            {realtime.devices.map((item) => (
              <div key={item.label} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
                <span className="min-w-0 truncate capitalize text-[var(--text)]">{item.label}</span>
                <span className="font-bold text-[var(--muted)]">{item.value}</span>
              </div>
            ))}
            {!realtime.devices.length && <p className="text-sm text-[var(--muted)]">Menunggu presence.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
