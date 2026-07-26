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
  {
    id: "copy-title",
    name: "Copy title",
    icon: "Copy",
    type: "copy",
    group: "record",
    template: "{title} ({year})",
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

interface ActionsState {
  actions: ActionDef[];
  addAction: (action: ActionDef) => void;
  updateAction: (id: string, patch: Partial<ActionDef>) => void;
  removeAction: (id: string) => void;
  moveAction: (id: string, direction: -1 | 1) => void;
  replaceAll: (actions: ActionDef[]) => void;
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
      replaceAll: (actions) => set({ actions }),
      resetToDefaults: () => set({ actions: DEFAULT_ACTIONS }),
    }),
    { name: "watchbridge.actions" },
  ),
);
