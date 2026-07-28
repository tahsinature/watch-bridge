import { create } from "zustand";
import { persist } from "zustand/middleware";
import { detectBrowserRegion } from "@/lib/browserRegion";
import type { SortOrder } from "@/types";

/**
 * User preferences persisted to localStorage. Kept intentionally small — the
 * app should work out of the box once a TMDB key is supplied. Everything here
 * is client-only; nothing is ever sent to a server we control.
 */
export interface SettingsState {
  tmdbApiKey: string;
  /** ISO 3166-1 country codes selected for "Where to watch" comparison. */
  regions: string[];
  /** How search results are ordered. */
  sortOrder: SortOrder;
  setTmdbApiKey: (key: string) => void;
  setSortOrder: (order: SortOrder) => void;
  setRegions: (regions: string[]) => void;
  /** Add the country if absent, remove it if present. */
  toggleRegion: (code: string) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      tmdbApiKey: "",
      // Persisted settings hydrate over this value, preserving manual choices.
      regions: [detectBrowserRegion()],
      sortOrder: "votes",
      setTmdbApiKey: (tmdbApiKey) => set({ tmdbApiKey: tmdbApiKey.trim() }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setRegions: (regions) => set({ regions }),
      toggleRegion: (code) =>
        set((s) => ({
          regions: s.regions.includes(code)
            ? s.regions.filter((r) => r !== code)
            : [...s.regions, code],
        })),
    }),
    {
      name: "watchbridge.settings",
      version: 2,
      migrate: (persisted) => {
        if (typeof persisted !== "object" || persisted === null) {
          return persisted as SettingsState;
        }
        const settings = { ...(persisted as Record<string, unknown>) };
        delete settings.notionUrl;
        delete settings.maxContentLevel;
        delete settings.includeAdult;
        return settings as unknown as SettingsState;
      },
    },
  ),
);

/** Convenience selector: is the app configured enough to make TMDB calls? */
export const useHasApiKey = () => useSettings((s) => s.tmdbApiKey.length > 0);
