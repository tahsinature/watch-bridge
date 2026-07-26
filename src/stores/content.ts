import { create } from "zustand";
import { persist } from "zustand/middleware";
import { itemKey } from "@/lib/library";
import type { ContentLevel, MediaType } from "@/types";

/**
 * Personal nudity levels, keyed by title. Kept separate from the library so a
 * title can be rated without being shortlisted.
 */
interface ContentState {
  levels: Record<string, ContentLevel>;
  setLevel: (id: number, mediaType: MediaType, level: ContentLevel) => void;
  clearLevel: (id: number, mediaType: MediaType) => void;
}

export const useContentLevels = create<ContentState>()(
  persist(
    (set) => ({
      levels: {},

      setLevel: (id, mediaType, level) =>
        set((s) => ({
          levels: { ...s.levels, [itemKey(id, mediaType)]: level },
        })),

      clearLevel: (id, mediaType) =>
        set((s) => {
          const next = { ...s.levels };
          delete next[itemKey(id, mediaType)];
          return { levels: next };
        }),
    }),
    { name: "watchbridge.content" },
  ),
);

/** Reactive lookup for a single title; undefined means "not rated yet". */
export function useContentLevel(
  id: number,
  mediaType: MediaType,
): ContentLevel | undefined {
  return useContentLevels((s) => s.levels[itemKey(id, mediaType)]);
}
