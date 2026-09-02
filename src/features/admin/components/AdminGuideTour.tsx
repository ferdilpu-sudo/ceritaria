"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminGuideSteps } from "@/features/admin/components/admin-guide-steps";

const SEEN_KEY = "ceritaria-admin-tour-seen-v2";
const START_EVENT = "ceritaria-admin-guide-start";

type Highlight = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function AdminGuideTour() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [highlight, setHighlight] = useState<Highlight | null>(null);

  const finish = useCallback(() => {
    window.localStorage.setItem(SEEN_KEY, "seen");
    setActive(false);
    setHighlight(null);
  }, []);

  const start = useCallback(() => {
    setIndex(0);
    setActive(true);
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem(SEEN_KEY) !== "seen") start();
    window.addEventListener(START_EVENT, start);
    return () => window.removeEventListener(START_EVENT, start);
  }, [start]);

  useEffect(() => {
    if (!active) return;
    const step = adminGuideSteps[index];
    if (!step) return;

    if (pathname !== step.path) {
      setHighlight(null);
      router.replace(step.path);
      return;
    }

    let frame = 0;
    let timeout = 0;

    const locate = () => {
      const target = document.querySelector<HTMLElement>(step.target);
      if (!target) {
        setHighlight(null);
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      timeout = window.setTimeout(() => {
        frame = window.requestAnimationFrame(() => {
          const rect = target.getBoundingClientRect();
          const padding = 6;
          setHighlight({
            top: Math.max(6, rect.top - padding),
            left: Math.max(6, rect.left - padding),
            width: Math.min(window.innerWidth - 12, rect.width + padding * 2),
            height: rect.height + padding * 2,
          });
        });
      }, 260);
    };

    locate();
    window.addEventListener("resize", locate);
    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", locate);
    };
  }, [active, index, pathname, router]);

  if (!active) return null;

  const step = adminGuideSteps[index];
  const isFirst = index === 0;
  const isLast = index === adminGuideSteps.length - 1;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none" aria-live="polite">
      {highlight ? (
        <div
          className="fixed rounded-2xl border-2 border-red-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.62)] transition-all duration-200"
          style={highlight}
        />
      ) : (
        <div className="fixed inset-0 bg-slate-950/60" />
      )}

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-tour-title"
        className="pointer-events-auto fixed inset-x-3 bottom-3 mx-auto w-auto max-w-xl rounded-3xl border border-[var(--border)] bg-white p-5 text-[var(--text)] shadow-2xl sm:bottom-6 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[0.16em] text-red-600">
              PANDUAN {index + 1}/{adminGuideSteps.length}
            </p>
            <h2 id="admin-tour-title" className="mt-1 text-xl font-black sm:text-2xl">
              {step.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={finish}
            className="min-h-11 shrink-0 px-2 text-sm font-bold text-[var(--muted)] hover:text-[var(--text)]"
          >
            Lewati
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-[15px]">{step.body}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
            className="min-h-11 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Kembali
          </button>
          <button
            type="button"
            onClick={() => {
              if (isLast) finish();
              else setIndex((current) => current + 1);
            }}
            className="min-h-11 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-black text-white hover:bg-[var(--primary-hover)]"
          >
            {isLast ? "Selesai" : "Next →"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function startAdminGuide() {
  window.dispatchEvent(new Event(START_EVENT));
}
