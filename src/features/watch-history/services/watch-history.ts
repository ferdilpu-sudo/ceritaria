export interface WatchHistoryItem {
  seriesSlug: string;
  seriesTitle: string;
  episodeSlug: string;
  episodeTitle: string;
  episodeNumber: number;
  thumbnailUrl: string | null;
  watchedAt: number;
}

const STORAGE_KEY = "ceritaria-watch-history-v1";
const CHANGE_EVENT = "ceritaria-watch-history-change";
const MAX_ITEMS = 12;

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

export function readWatchHistory(): WatchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isHistoryItem).slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

export function rememberEpisode(item: Omit<WatchHistoryItem, "watchedAt">) {
  if (typeof window === "undefined") return;
  const nextItem: WatchHistoryItem = { ...item, watchedAt: Date.now() };
  const history = readWatchHistory().filter((entry) => !(entry.seriesSlug === item.seriesSlug && entry.episodeSlug === item.episodeSlug));
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([nextItem, ...history].slice(0, MAX_ITEMS)));
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
