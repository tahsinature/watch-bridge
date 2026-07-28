import type {
  LibraryItem,
  MediaType,
  SearchResult,
  SelectionRef,
  TitleDetails,
} from "@/types";

/** Stable composite key for a title — for map keys and URLs. */
export function itemKey(id: number, mediaType: MediaType): string {
  return `${mediaType}-${id}`;
}

type TitleRef = { id: number; mediaType: MediaType };

/**
 * Do two references point at the same title? Compares fields directly rather
 * than building two `itemKey` strings, which matters inside array scans.
 */
export function sameTitle(a: TitleRef, b: TitleRef): boolean {
  return a.id === b.id && a.mediaType === b.mediaType;
}

/** Narrow any title-shaped object down to what the detail view needs. */
export function toSelectionRef(item: TitleRef & { title: string }): SelectionRef {
  return { id: item.id, mediaType: item.mediaType, title: item.title };
}

const baseItem = {
  status: "shortlist" as const,
  userRating: null,
  notes: "",
  watchedAt: null,
};

/** Build a library item from a search result (basic fields only). */
export function fromSearchResult(r: SearchResult): LibraryItem {
  return {
    id: r.id,
    mediaType: r.mediaType,
    title: r.title,
    year: r.year,
    posterPath: r.posterPath,
    backdropPath: r.backdropPath,
    voteAverage: r.voteAverage,
    voteCount: r.voteCount,
    adult: r.adult,
    overview: r.overview,
    imdbId: null,
    genres: [],
    runtime: null,
    addedAt: Date.now(),
    ...baseItem,
  };
}

/** Build a library item from full details (includes imdbId, genres, runtime). */
export function fromDetails(d: TitleDetails): LibraryItem {
  return {
    id: d.id,
    mediaType: d.mediaType,
    title: d.title,
    year: d.year,
    posterPath: d.posterPath,
    backdropPath: d.backdropPath,
    voteAverage: d.voteAverage,
    voteCount: d.voteCount,
    adult: d.adult,
    overview: d.overview,
    imdbId: d.imdbId,
    genres: d.genres,
    runtime: d.runtime,
    addedAt: Date.now(),
    ...baseItem,
  };
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
