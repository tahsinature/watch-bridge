import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ActionDef } from "@/types";

/** Sensible defaults so actions work out of the box with zero setup. */
export const DEFAULT_ACTIONS: ActionDef[] = [
  {
    id: "imdb",
    name: "IMDb",
    icon: "Film",
    type: "open-url",
    group: "search",
    template: "https://www.imdb.com/title/{imdbId}/",
    enabled: true,
  },
  {
    id: "tmdb",
    name: "TMDB",
    icon: "Clapperboard",
    type: "open-url",
    group: "search",
    // {type} is already "movie" or "tv" — exactly TMDB's URL path segment.
    template: "https://www.themoviedb.org/{type}/{tmdbId}",
    enabled: true,
  },
  {
    id: "extto",
    name: "extto",
    icon: "Download",
    type: "open-url",
    group: "download",
    template: "https://search.extto.com/browse/?imdb_id={imdbId}",
    enabled: true,
  },
  {
    id: "1337x",
    name: "1337x",
    icon: "Magnet",
    type: "open-url",
    group: "download",
    template: "https://1337x.to/search/{titleEncoded}+{year}/1/",
    enabled: true,
  },
  {
    id: "yt-trailers",
    name: "YouTube",
    icon: "Youtube",
    type: "open-url",
    group: "search",
    template:
      "https://www.youtube.com/results?search_query={titleEncoded}+{year}+trailer",
    enabled: true,
  },
  {
    id: "parents-guide",
    name: "Parents Guide",
    icon: "Bookmark",
    type: "open-url",
    group: "search",
    template: "https://www.imdb.com/title/{imdbId}/parentalguide",
    enabled: true,
  },
  {
    id: "letterboxd",
    name: "Letterboxd",
    icon: "Star",
    type: "open-url",
    group: "search",
    template: "https://letterboxd.com/search/{titleEncoded}/",
    enabled: true,
  },
  {
    id: "google",
    name: "Google",
    icon: "Globe",
    type: "open-url",
    group: "search",
    template: "https://www.google.com/search?q={titleEncoded}+{year}",
    enabled: true,
  },
  // Disabled examples — templates to copy from when wiring up your own setup.
  {
    id: "nas-example",
    name: "Send to NAS (example)",
    icon: "Server",
    type: "http-request",
    group: "download",
    method: "POST",
    template: "https://your-nas.local:5001/webapi/entry.cgi",
    headers: "Content-Type: application/x-www-form-urlencoded",
    body: "uri={clipboardEncoded}",
    confirm: true,
    enabled: false,
  },
  {
    id: "app-example",
    name: "Open in app (example)",
    icon: "Rocket",
    type: "deep-link",
    group: "custom",
    template: "myapp://add?imdb={imdbId}&title={titleEncoded}",
    enabled: false,
  },
];

/**
 * Bump when a new entry is added to DEFAULT_ACTIONS, and list its id below.
 * Existing users already have a persisted action list, so new defaults only
 * reach them through a migration.
 */
const STORE_VERSION = 1;

/**
 * Default action ids introduced in each store version. Migrating adds only
 * these — defaults the user deliberately deleted stay deleted.
 */
const ADDED_IN_VERSION: Record<number, string[]> = {
  1: ["tmdb"],
};

interface ActionsState {
  actions: ActionDef[];
  addAction: (action: ActionDef) => void;
  updateAction: (id: string, patch: Partial<ActionDef>) => void;
  removeAction: (id: string) => void;
  moveAction: (id: string, direction: -1 | 1) => void;
  resetToDefaults: () => void;
}

export const useActions = create<ActionsState>()(
  persist(
    (set) => ({
      actions: DEFAULT_ACTIONS,
      addAction: (action) =>
        set((s) => ({ actions: [...s.actions, action] })),
      updateAction: (id, patch) =>
        set((s) => ({
          actions: s.actions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      removeAction: (id) =>
        set((s) => ({ actions: s.actions.filter((a) => a.id !== id) })),
      moveAction: (id, direction) =>
        set((s) => {
          const index = s.actions.findIndex((a) => a.id === id);
          const target = index + direction;
          if (index === -1 || target < 0 || target >= s.actions.length) {
            return s;
          }
          const actions = [...s.actions];
          [actions[index], actions[target]] = [actions[target], actions[index]];
          return { actions };
        }),
      resetToDefaults: () => set({ actions: DEFAULT_ACTIONS }),
    }),
    {
      name: "watchbridge.actions",
      version: STORE_VERSION,

      /** Append defaults added since the stored list was written. */
      migrate: (persisted, fromVersion) => {
        const state = persisted as ActionsState;
        const actions = Array.isArray(state?.actions)
          ? state.actions
          : DEFAULT_ACTIONS;

        const newIds = Object.entries(ADDED_IN_VERSION)
          .filter(([version]) => Number(version) > fromVersion)
          .flatMap(([, ids]) => ids);

        const existing = new Set(actions.map((a) => a.id));
        const additions = DEFAULT_ACTIONS.filter(
          (a) => newIds.includes(a.id) && !existing.has(a.id),
        );

        return { ...state, actions: [...actions, ...additions] };
      },
    },
  ),
);
