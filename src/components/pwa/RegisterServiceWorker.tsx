"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { InstallAppCta } from "@/components/pwa/InstallAppCta";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const VISIT_KEY = "ceritaria-pwa-visits";
const INSTALL_SNOOZE_KEY = "ceritaria-pwa-install-snoozed-at";
const INSTALL_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

function isEpisodePlayback(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts[0] === "series" && parts.length >= 3;
}

function canOfferInstall() {
  try {
    const snoozedAt = Number(window.localStorage.getItem(INSTALL_SNOOZE_KEY) ?? "0");
    return !snoozedAt || Date.now() - snoozedAt >= INSTALL_SNOOZE_MS;
  } catch {
    return true;
  }
}

function snoozeInstall() {
  try {
    window.localStorage.setItem(INSTALL_SNOOZE_KEY, String(Date.now()));
  } catch {
    // Storage may be unavailable in private browsing.
  }
}

export function RegisterServiceWorker() {
  const pathname = usePathname();
  const shouldReload = useRef(false);
  const [online, setOnline] = useState(true);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    let visits = 1;
    try {
      visits = Number(window.localStorage.getItem(VISIT_KEY) ?? "0") + 1;
      window.localStorage.setItem(VISIT_KEY, String(visits));
    } catch {
      visits = 1;
    }

    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      if (visits >= 2 && !standalone && canOfferInstall()) {
        setInstallPrompt(event as BeforeInstallPromptEvent);
      }
    };
    const onInstalled = () => setInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    const onControllerChange = () => {
      if (shouldReload.current) window.location.reload();
    };
    navigator.serviceWorker?.addEventListener("controllerchange", onControllerChange);

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").then((nextRegistration) => {
        setRegistration(nextRegistration);
        if (nextRegistration.waiting && navigator.serviceWorker.controller) setUpdateReady(true);
        nextRegistration.addEventListener("updatefound", () => {
          const worker = nextRegistration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) setUpdateReady(true);
          });
        });
      }).catch((error) => console.warn("Ceritaria PWA registration failed", error));
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      navigator.serviceWorker?.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const playback = isEpisodePlayback(pathname);
  const position = playback
    ? "bottom-[max(1rem,env(safe-area-inset-bottom))]"
    : "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-4";

  if (!online) {
    return (
      <div role="status" className={`fixed inset-x-3 z-[70] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-amber-700/40 bg-zinc-950/95 p-3 text-sm shadow-2xl backdrop-blur ${position}`}>
        <span className="font-bold text-amber-200">Kamu sedang offline.</span>
        <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-white px-4 font-black text-black">Coba lagi</button>
      </div>
    );
  }

  if (playback) return null;

  if (updateReady) {
    return (
      <div role="status" className={`fixed inset-x-3 z-[70] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-950/95 p-3 text-sm shadow-2xl backdrop-blur ${position}`}>
        <span className="font-bold">Versi baru Ceritaria tersedia.</span>
        <button type="button" onClick={() => { shouldReload.current = true; registration?.waiting?.postMessage({ type: "SKIP_WAITING" }); }} className="min-h-11 rounded-xl bg-[var(--primary)] px-4 font-black text-white">Perbarui</button>
      </div>
    );
  }

  if (installPrompt) {
    return (
      <InstallAppCta
        onDismiss={() => {
          snoozeInstall();
          setInstallPrompt(null);
        }}
        onInstall={async () => {
          await installPrompt.prompt();
          const choice = await installPrompt.userChoice;
          if (choice.outcome === "dismissed") snoozeInstall();
          setInstallPrompt(null);
        }}
      />
    );
  }

  return null;
}
