import { create } from "zustand";
import { persist } from "zustand/middleware";
import { itemKey } from "@/lib/library";
import type { MediaType } from "@/types";

const MAX_RECENT_TITLES = 20;

/** Just enough to render a poster card and reopen the detail view. */
export interface RecentTitle {
  id: number;
  mediaType: MediaType;
  title: string;
  year: string;
  posterPath: string | null;
}

/**
 * Titles opened from search results, newest first. Deliberately not recorded
 * from the Shortlist/Watched views — those are already one click away in their
 * own tabs, and recording them would crowd out the search finds you'd
 * otherwise lose track of.
 */
interface RecentTitlesState {
  titles: RecentTitle[];
  record: (title: RecentTitle) => void;
  remove: (id: number, mediaType: MediaType) => void;
  clear: () => void;
}

export const useRecentTitles = create<RecentTitlesState>()(
  persist(
    (set) => ({
      titles: [],

      record: (title) =>
        set((s) => {
          // Re-opening moves a title to the front instead of duplicating it.
          const key = itemKey(title.id, title.mediaType);
          const kept = s.titles.filter(
            (t) => itemKey(t.id, t.mediaType) !== key,
          );
          return { titles: [title, ...kept].slice(0, MAX_RECENT_TITLES) };
        }),

      remove: (id, mediaType) =>
        set((s) => ({
          titles: s.titles.filter(
            (t) => itemKey(t.id, t.mediaType) !== itemKey(id, mediaType),
          ),
        })),

      clear: () => set({ titles: [] }),
    }),
    { name: "watchbridge.recentTitles" },
  ),
);
