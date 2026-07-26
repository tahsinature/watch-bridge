import { create } from "zustand";
import { persist } from "zustand/middleware";
import { itemKey } from "@/lib/library";
import type { LibraryItem, MediaType } from "@/types";

interface LibraryState {
  items: LibraryItem[];
  /** Add to shortlist if not already present. */
  addToShortlist: (item: LibraryItem) => void;
  remove: (id: number, mediaType: MediaType) => void;
  update: (id: number, mediaType: MediaType, patch: Partial<LibraryItem>) => void;
  /** Mark watched — upserts, so it works even for un-shortlisted titles. */
  markWatched: (item: LibraryItem, userRating: number | null, notes: string) => void;
  returnToShortlist: (id: number, mediaType: MediaType) => void;
}

export const useLibrary = create<LibraryState>()(
  persist(
    (set) => ({
      items: [],

      addToShortlist: (item) =>
        set((s) => {
          const key = itemKey(item.id, item.mediaType);
          if (s.items.some((i) => itemKey(i.id, i.mediaType) === key)) return s;
          return { items: [...s.items, { ...item, status: "shortlist" }] };
        }),

      remove: (id, mediaType) =>
        set((s) => ({
          items: s.items.filter(
            (i) => itemKey(i.id, i.mediaType) !== itemKey(id, mediaType),
          ),
        })),

      update: (id, mediaType, patch) =>
        set((s) => ({
          items: s.items.map((i) =>
            itemKey(i.id, i.mediaType) === itemKey(id, mediaType)
              ? { ...i, ...patch }
              : i,
          ),
        })),

      markWatched: (item, userRating, notes) =>
        set((s) => {
          const key = itemKey(item.id, item.mediaType);
          const patch = {
            status: "watched" as const,
            userRating,
            notes,
            watchedAt: Date.now(),
          };
          const exists = s.items.some((i) => itemKey(i.id, i.mediaType) === key);
          if (exists) {
            return {
              items: s.items.map((i) =>
                itemKey(i.id, i.mediaType) === key ? { ...i, ...patch } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, ...patch }] };
        }),

      returnToShortlist: (id, mediaType) =>
        set((s) => ({
          items: s.items.map((i) =>
            itemKey(i.id, i.mediaType) === itemKey(id, mediaType)
              ? { ...i, status: "shortlist", watchedAt: null }
              : i,
          ),
        })),
    }),
    { name: "watchbridge.library" },
  ),
);

/** Reactive helper: is this title already in the library? */
export function useInLibrary(id: number, mediaType: MediaType): boolean {
  return useLibrary((s) =>
    s.items.some((i) => itemKey(i.id, i.mediaType) === itemKey(id, mediaType)),
  );
}
