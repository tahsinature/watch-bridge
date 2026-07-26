import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ContentLevel, SortOrder } from "@/types";

/**
 * User preferences persisted to localStorage. Kept intentionally small — the
 * app should work out of the box once a TMDB key is supplied. Everything here
 * is client-only; nothing is ever sent to a server we control.
 */
export interface SettingsState {
  tmdbApiKey: string;
  /** ISO 3166-1 country codes selected for "Where to watch" comparison. */
  regions: string[];
  /** Optional Notion page/database URL opened by the "Log to Notion" action. */
  notionUrl: string;
  /** Highest acceptable content level; null disables the filter. */
  maxContentLevel: ContentLevel | null;
  /** How search results are ordered. */
  sortOrder: SortOrder;
  setTmdbApiKey: (key: string) => void;
  setSortOrder: (order: SortOrder) => void;
  setRegions: (regions: string[]) => void;
  /** Add the country if absent, remove it if present. */
  toggleRegion: (code: string) => void;
  setNotionUrl: (url: string) => void;
  setMaxContentLevel: (level: ContentLevel | null) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      tmdbApiKey: "",
      regions: ["US"],
      notionUrl: "",
      maxContentLevel: null,
      sortOrder: "votes",
      setTmdbApiKey: (tmdbApiKey) => set({ tmdbApiKey: tmdbApiKey.trim() }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setMaxContentLevel: (maxContentLevel) => set({ maxContentLevel }),
      setRegions: (regions) => set({ regions }),
      toggleRegion: (code) =>
        set((s) => ({
          regions: s.regions.includes(code)
            ? s.regions.filter((r) => r !== code)
            : [...s.regions, code],
        })),
      setNotionUrl: (notionUrl) => set({ notionUrl: notionUrl.trim() }),
    }),
    { name: "watchbridge.settings" },
  ),
);

/** Convenience selector: is the app configured enough to make TMDB calls? */
export const useHasApiKey = () => useSettings((s) => s.tmdbApiKey.length > 0);
