"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminGuideSteps } from "@/features/admin/components/admin-guide-steps";

const SEEN_KEY = "ceritaria-admin-tour-seen-v2";
const START_EVENT = "ceritaria-admin-guide-start";
const VIEWPORT_GUTTER = 12;

type Highlight = { top: number; left: number; width: number; height: number };
type PanelFrame = { left: number; width: number };
type Bounds = { left: number; right: number; top: number; bottom: number };

function findVisibleTarget(selector: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).find((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
  });
}

function getAppBounds(): Bounds {
  const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const app = document.querySelector<HTMLElement>(".admin-theme");
  const rect = app?.getBoundingClientRect();

  return {
    left: Math.max(0, rect?.left ?? 0),
    right: Math.min(viewportWidth, rect?.right ?? viewportWidth),
    top: Math.max(0, rect?.top ?? 0),
    bottom: Math.min(viewportHeight, rect?.bottom ?? viewportHeight),
  };
}

function getPanelFrame(): PanelFrame {
  const bounds = getAppBounds();
  const available = Math.max(0, bounds.right - bounds.left - VIEWPORT_GUTTER * 2);
  const width = Math.min(576, available);

  return {
    left: bounds.left + Math.max(VIEWPORT_GUTTER, (bounds.right - bounds.left - width) / 2),
    width,
  };
}

function getClampedHighlight(target: HTMLElement): Highlight {
  const rect = target.getBoundingClientRect();
  const bounds = getAppBounds();
  const padding = 6;
  const left = Math.max(bounds.left + VIEWPORT_GUTTER, rect.left - padding);
  const right = Math.min(bounds.right - VIEWPORT_GUTTER, rect.right + padding);
  const top = Math.max(bounds.top + VIEWPORT_GUTTER, rect.top - padding);
  const bottom = Math.min(bounds.bottom - VIEWPORT_GUTTER, rect.bottom + padding);

  return { top, left, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

export function AdminGuideTour() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [panelFrame, setPanelFrame] = useState<PanelFrame | null>(null);

  const finish = useCallback(() => {
    window.localStorage.setItem(SEEN_KEY, "seen");
    setActive(false);
    setHighlight(null);
    setPanelFrame(null);
  }, []);

  const start = useCallback(() => {
    setIndex(0);
    setActive(true);
  }, []);

  useEffect(() => {
    if (pathname === "/admin" && window.localStorage.getItem(SEEN_KEY) !== "seen") start();
    window.addEventListener(START_EVENT, start);
    return () => window.removeEventListener(START_EVENT, start);
  }, [pathname, start]);

  useEffect(() => {
    if (!active) return;
    const step = adminGuideSteps[index];
    if (!step) return;

    const updateFrame = () => setPanelFrame(getPanelFrame());
    updateFrame();

    if (pathname !== step.path) {
      setHighlight(null);
      router.replace(step.path);
      return;
    }

    let frame = 0;
    let timeout = 0;
    const locate = () => {
      updateFrame();
      const target = findVisibleTarget(step.target);
      if (!target) return setHighlight(null);

      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      timeout = window.setTimeout(() => {
        frame = window.requestAnimationFrame(() => setHighlight(getClampedHighlight(target)));
      }, 240);
    };

    locate();
    window.addEventListener("resize", locate);
    window.visualViewport?.addEventListener("resize", locate);
    window.visualViewport?.addEventListener("scroll", locate);
    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", locate);
      window.visualViewport?.removeEventListener("resize", locate);
      window.visualViewport?.removeEventListener("scroll", locate);
    };
  }, [active, index, pathname, router]);

  if (!active || !panelFrame) return null;

  const step = adminGuideSteps[index];
  const isFirst = index === 0;
  const isLast = index === adminGuideSteps.length - 1;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-live="polite">
      {highlight ? (
        <div className="fixed rounded-2xl border-2 border-red-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.62)] transition-all duration-200" style={highlight} />
      ) : (
        <div className="fixed inset-0 bg-slate-950/60" />
      )}

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-tour-title"
        style={{ left: panelFrame.left, width: panelFrame.width }}
        className="pointer-events-auto fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] overflow-hidden rounded-[22px] border border-[var(--border)] bg-white p-4 text-[var(--text)] shadow-2xl sm:bottom-6 sm:p-6"
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black tracking-[0.16em] text-red-600 sm:text-xs">PANDUAN {index + 1}/{adminGuideSteps.length}</p>
            <h2 id="admin-tour-title" className="mt-1 break-words text-lg font-black sm:text-2xl">{step.title}</h2>
          </div>
          <button type="button" onClick={finish} className="min-h-10 shrink-0 px-2 text-sm font-bold text-[var(--muted)] hover:text-[var(--text)]">Lewati</button>
        </div>

        <p className="mt-2.5 break-words text-[13px] leading-5 text-[var(--muted)] sm:mt-3 sm:text-[15px] sm:leading-6">{step.body}</p>

        <div className="mt-4 flex items-center justify-between gap-2.5 sm:mt-5 sm:gap-3">
          <button type="button" disabled={isFirst} onClick={() => setIndex((current) => Math.max(0, current - 1))}
            className="min-h-11 min-w-0 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 sm:px-4">
            ← Kembali
          </button>
          <button type="button" onClick={() => isLast ? finish() : setIndex((current) => current + 1)}
            className="min-h-11 min-w-0 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-black text-white hover:bg-[var(--primary-hover)] sm:px-5">
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
