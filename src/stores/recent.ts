import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT = 8;

interface RecentSearchesState {
  queries: string[];
  record: (query: string) => void;
  remove: (query: string) => void;
  clear: () => void;
}

export const useRecentSearches = create<RecentSearchesState>()(
  persist(
    (set) => ({
      queries: [],

      record: (raw) => {
        const query = raw.trim();
        if (query.length < 2) return;
        set((s) => {
          const lower = query.toLowerCase();
          /*
           * Drop entries where one is a prefix of the other, so typing
           * "int" → "inter" → "interstellar" leaves a single entry rather
           * than three partial ones.
           */
          const kept = s.queries.filter((q) => {
            const existing = q.toLowerCase();
            return !existing.startsWith(lower) && !lower.startsWith(existing);
          });
          return { queries: [query, ...kept].slice(0, MAX_RECENT) };
        });
      },

      remove: (query) =>
        set((s) => ({ queries: s.queries.filter((q) => q !== query) })),

      clear: () => set({ queries: [] }),
    }),
    { name: "watchbridge.recent" },
  ),
);
