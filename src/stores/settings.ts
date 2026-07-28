import { create } from "zustand";
import { persist } from "zustand/middleware";
import { detectBrowserRegion } from "@/lib/browserRegion";
import {
  DEFAULT_MINIMUM_VOTES,
  isMinimumVotes,
} from "@/lib/voteFilter";
import {
  DEFAULT_COMPARE_FIELDS,
  isCompareFields,
  type CompareField,
} from "@/lib/compareFields";
import type { MinimumVotes, SortOrder } from "@/types";

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
  /** Hide search and discovery results below this TMDB vote count. */
  minimumVotes: MinimumVotes;
  /** Visible columns in the shortlist comparison table. */
  compareFields: CompareField[];
  setTmdbApiKey: (key: string) => void;
  setSortOrder: (order: SortOrder) => void;
  setMinimumVotes: (minimumVotes: MinimumVotes) => void;
  setCompareFields: (compareFields: CompareField[]) => void;
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
      minimumVotes: DEFAULT_MINIMUM_VOTES,
      compareFields: DEFAULT_COMPARE_FIELDS,
      setTmdbApiKey: (tmdbApiKey) => set({ tmdbApiKey: tmdbApiKey.trim() }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setMinimumVotes: (minimumVotes) => set({ minimumVotes }),
      setCompareFields: (compareFields) => set({ compareFields }),
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
      version: 4,
      migrate: (persisted) => {
        if (typeof persisted !== "object" || persisted === null) {
          return persisted as SettingsState;
        }
        const settings = { ...(persisted as Record<string, unknown>) };
        delete settings.notionUrl;
        delete settings.maxContentLevel;
        delete settings.includeAdult;
        if (!isMinimumVotes(settings.minimumVotes)) {
          settings.minimumVotes = DEFAULT_MINIMUM_VOTES;
        }
        if (!isCompareFields(settings.compareFields)) {
          settings.compareFields = DEFAULT_COMPARE_FIELDS;
        }
        return settings as unknown as SettingsState;
      },
    },
  ),
);

/** Convenience selector: is the app configured enough to make TMDB calls? */
export const useHasApiKey = () => useSettings((s) => s.tmdbApiKey.length > 0);
