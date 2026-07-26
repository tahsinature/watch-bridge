import { useCallback, useEffect, useState } from "react";
import { itemKey } from "@/lib/library";
import type { MediaType, SelectionRef, View } from "@/types";

const VIEWS: View[] = ["search", "shortlist", "watched"];

interface UrlState {
  view: View;
  selection: SelectionRef | null;
}

/**
 * Stamped on every history entry this app pushes, so closing a title knows
 * whether there's an entry of ours to step back to — as opposed to having
 * been opened straight from a shared link, where back would leave the app.
 */
const OURS = { watchBridge: true };

function parseView(raw: string | null): View {
  return VIEWS.find((view) => view === raw) ?? "search";
}

/** "movie-693134" → { mediaType, id }. Null when absent or malformed. */
function parseSelection(raw: string | null): SelectionRef | null {
  if (!raw) return null;
  const separator = raw.indexOf("-");
  const mediaType = raw.slice(0, separator) as MediaType;
  const id = Number(raw.slice(separator + 1));
  if (mediaType !== "movie" && mediaType !== "tv") return null;
  return Number.isInteger(id) && id > 0 ? { id, mediaType } : null;
}

function readUrl(): UrlState {
  const params = new URLSearchParams(window.location.search);
  return {
    view: parseView(params.get("view")),
    selection: parseSelection(params.get("title")),
  };
}

/** Only non-default values are written, so the home screen URL stays bare. */
function toUrl({ view, selection }: UrlState): string {
  const params = new URLSearchParams();
  if (view !== "search") params.set("view", view);
  if (selection) params.set("title", itemKey(selection.id, selection.mediaType));
  const query = params.toString();
  return query ? `?${query}` : window.location.pathname;
}

/**
 * Keeps the current tab and open title in the URL's query string, so a
 * refresh restores them and Back/Forward step through them.
 *
 * Query params rather than a path because GitHub Pages serves static files
 * with no rewrite rules — the path must keep resolving to index.html.
 */
export function useUrlState() {
  const [state, setState] = useState<UrlState>(readUrl);

  // Back/Forward: adopt whichever entry the browser landed on.
  useEffect(() => {
    const syncFromUrl = () => setState(readUrl());
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const push = useCallback((next: UrlState) => {
    setState(next);
    window.history.pushState(OURS, "", toUrl(next));
  }, []);

  const setView = useCallback(
    (view: View) => push({ view, selection: null }),
    [push],
  );

  const setSelection = useCallback(
    (selection: SelectionRef | null) => {
      if (selection) {
        push({ view: state.view, selection });
        return;
      }
      if (window.history.state?.watchBridge) {
        // We pushed this entry, so stepping back both closes the title and
        // leaves Forward able to reopen it. popstate syncs the state.
        window.history.back();
        return;
      }
      // Landed here directly — drop the param without growing history.
      const next = { view: state.view, selection: null };
      setState(next);
      window.history.replaceState(null, "", toUrl(next));
    },
    [push, state.view],
  );

  return { view: state.view, selection: state.selection, setView, setSelection };
}
