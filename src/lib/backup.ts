import {
  RETIRED_DEFAULT_ACTION_IDS,
  useActions,
} from "@/stores/actions";
import { useLibrary } from "@/stores/library";
import { useRecentSearches } from "@/stores/recent";
import { useRecentTitles, type RecentTitle } from "@/stores/recentTitles";
import { useSettings, type SettingsState } from "@/stores/settings";
import type { ActionDef, LibraryItem } from "@/types";

const APP_TAG = "watchbridge";
const BACKUP_VERSION = 2;

/**
 * Everything the app keeps, in one file. Versioned so a future format change
 * can migrate old backups rather than rejecting them.
 */
export interface BackupFile {
  app: typeof APP_TAG;
  version: number;
  exportedAt: string;
  data: {
    settings?: Record<string, unknown>;
    actions?: unknown[];
    library?: unknown[];
    recent?: unknown[];
    recentTitles?: unknown[];
  };
}

export function buildBackup(includeApiKey: boolean): BackupFile {
  const { tmdbApiKey, regions, sortOrder } = useSettings.getState();

  return {
    app: APP_TAG,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      settings: {
        ...(includeApiKey ? { tmdbApiKey } : {}),
        regions,
        sortOrder,
      },
      actions: useActions.getState().actions,
      library: useLibrary.getState().items,
      recent: useRecentSearches.getState().queries,
      recentTitles: useRecentTitles.getState().titles,
    },
  };
}

// ---- Validation -----------------------------------------------------------
// Hand-written rather than schema-driven: the shapes are small, and a restore
// that silently accepts junk would corrupt several stores at once.

type Obj = Record<string, unknown>;

const isObject = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isMediaType = (v: unknown) => v === "movie" || v === "tv";

const ACTION_TYPES = ["open-url", "copy", "deep-link", "http-request"];
const ACTION_GROUPS = ["download", "search", "record", "custom"];

function isActionDef(v: unknown): v is ActionDef {
  return (
    isObject(v) &&
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.template === "string" &&
    typeof v.enabled === "boolean" &&
    !RETIRED_DEFAULT_ACTION_IDS.has(v.id) &&
    ACTION_TYPES.includes(v.type as string) &&
    ACTION_GROUPS.includes(v.group as string)
  );
}

function isLibraryItem(v: unknown): v is LibraryItem {
  return (
    isObject(v) &&
    typeof v.id === "number" &&
    isMediaType(v.mediaType) &&
    typeof v.title === "string" &&
    (v.status === "shortlist" || v.status === "watched")
  );
}

function isRecentTitle(v: unknown): v is RecentTitle {
  return (
    isObject(v) &&
    typeof v.id === "number" &&
    isMediaType(v.mediaType) &&
    typeof v.title === "string"
  );
}

/** Fill in fields added after this backup was written. */
function healLibraryItem(item: LibraryItem): LibraryItem {
  return {
    ...item,
    voteCount: typeof item.voteCount === "number" ? item.voteCount : 0,
    adult: typeof item.adult === "boolean" ? item.adult : false,
    genres: Array.isArray(item.genres) ? item.genres : [],
    notes: typeof item.notes === "string" ? item.notes : "",
  };
}

// ---- Restore --------------------------------------------------------------

export interface RestoreSummary {
  settings: boolean;
  actions: number;
  library: number;
  recentSearches: number;
  recentTitles: number;
  /** Entries dropped because they didn't match the expected shape. */
  skipped: number;
}

export class BackupError extends Error {}

/**
 * Replace all local state from a parsed backup file. Sections that are absent
 * are left untouched; individual entries that fail validation are skipped and
 * counted, so one bad row can't abort an otherwise good restore.
 */
export function restoreBackup(raw: unknown): RestoreSummary {
  if (!isObject(raw) || raw.app !== APP_TAG || !isObject(raw.data)) {
    throw new BackupError("That doesn't look like a WatchBridge backup.");
  }
  if (typeof raw.version === "number" && raw.version > BACKUP_VERSION) {
    throw new BackupError(
      "This backup came from a newer version of WatchBridge.",
    );
  }

  const data = raw.data;
  const summary: RestoreSummary = {
    settings: false,
    actions: 0,
    library: 0,
    recentSearches: 0,
    recentTitles: 0,
    skipped: 0,
  };

  /** Keep entries matching `guard`, tallying whatever didn't survive. */
  const keepValid = <T>(all: unknown[], guard: (v: unknown) => v is T): T[] => {
    const kept = all.filter(guard);
    summary.skipped += all.length - kept.length;
    return kept;
  };

  if (isObject(data.settings)) {
    const s = data.settings;
    const patch: Partial<SettingsState> = {};
    if (typeof s.tmdbApiKey === "string") patch.tmdbApiKey = s.tmdbApiKey;
    if (Array.isArray(s.regions) && s.regions.every((r) => typeof r === "string")) {
      patch.regions = s.regions as string[];
    }
    if (typeof s.sortOrder === "string") {
      patch.sortOrder = s.sortOrder as SettingsState["sortOrder"];
    }
    useSettings.setState(patch);
    summary.settings = Object.keys(patch).length > 0;
  }

  if (Array.isArray(data.actions)) {
    const actions = keepValid(data.actions, isActionDef);
    useActions.setState({ actions });
    summary.actions = actions.length;
  }

  if (Array.isArray(data.library)) {
    const items = keepValid(data.library, isLibraryItem).map(healLibraryItem);
    useLibrary.setState({ items });
    summary.library = items.length;
  }

  if (Array.isArray(data.recent)) {
    const queries = keepValid(
      data.recent,
      (q): q is string => typeof q === "string",
    );
    useRecentSearches.setState({ queries });
    summary.recentSearches = queries.length;
  }

  if (Array.isArray(data.recentTitles)) {
    const titles = keepValid(data.recentTitles, isRecentTitle);
    useRecentTitles.setState({ titles });
    summary.recentTitles = titles.length;
  }

  return summary;
}
