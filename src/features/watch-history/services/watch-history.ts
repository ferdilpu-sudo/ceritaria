export interface WatchHistoryItem {
  seriesSlug: string;
  seriesTitle: string;
  episodeSlug: string;
  episodeTitle: string;
  episodeNumber: number;
  thumbnailUrl: string | null;
  progressPercent: number;
  completed: boolean;
  watchedAt: number;
}

const STORAGE_KEY = "ceritaria-watch-history-v1";
const CHANGE_EVENT = "ceritaria-watch-history-change";
const MAX_ITEMS = 12;

function normalizeProgress(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function isHistoryItem(value: unknown): value is WatchHistoryItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<WatchHistoryItem>;
  return typeof item.seriesSlug === "string"
    && typeof item.seriesTitle === "string"
    && typeof item.episodeSlug === "string"
    && typeof item.episodeTitle === "string"
    && typeof item.episodeNumber === "number"
    && Number.isFinite(item.episodeNumber)
    && (typeof item.thumbnailUrl === "string" || item.thumbnailUrl === null)
    && typeof item.watchedAt === "number";
}

function normalizeItem(item: WatchHistoryItem): WatchHistoryItem {
  const progressPercent = normalizeProgress(item.progressPercent);
  return { ...item, progressPercent, completed: item.completed === true || progressPercent >= 90 };
}

export function readWatchHistory(): WatchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isHistoryItem).map(normalizeItem).slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

export function rememberEpisode(item: Omit<WatchHistoryItem, "watchedAt" | "progressPercent" | "completed">) {
  if (typeof window === "undefined") return;
  const history = readWatchHistory();
  const existing = history.find((entry) => entry.seriesSlug === item.seriesSlug && entry.episodeSlug === item.episodeSlug);
  const nextItem: WatchHistoryItem = {
    ...item,
    progressPercent: existing?.progressPercent ?? 0,
    completed: existing?.completed ?? false,
    watchedAt: Date.now(),
  };
  saveHistory([nextItem, ...history.filter((entry) => !(entry.seriesSlug === item.seriesSlug && entry.episodeSlug === item.episodeSlug))]);
}

export function updateWatchProgress(seriesSlug: string, episodeSlug: string, progressPercent: number) {
  const history = readWatchHistory();
  const index = history.findIndex((entry) => entry.seriesSlug === seriesSlug && entry.episodeSlug === episodeSlug);
  if (index < 0) return;
  const progress = normalizeProgress(progressPercent);
  history[index] = { ...history[index], progressPercent: progress, completed: progress >= 90, watchedAt: Date.now() };
  saveHistory(history);
}

function saveHistory(items: WatchHistoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Storage can be unavailable in private/restricted browser modes.
  }
}

export function clearWatchHistory() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Storage can be unavailable in private/restricted browser modes.
  }
}

export function subscribeWatchHistory(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}
