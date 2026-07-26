export type MediaType = "movie" | "tv";

/**
 * Personal nudity/sexual-content scale. TMDB has no such data, so this is
 * always user-supplied — see IMDb's Parents Guide "Sex & Nudity" severity.
 */
export type ContentLevel = 0 | 1 | 2 | 3;

export const CONTENT_LEVELS: {
  value: ContentLevel;
  label: string;
  hint: string;
}[] = [
  { value: 0, label: "0 – No", hint: "Nothing" },
  { value: 1, label: "1 – Kissing & Related", hint: "Kissing and similar" },
  { value: 2, label: "2 – Very", hint: "Sexual activity, no full exposure" },
  { value: 3, label: "3 – Open", hint: "Nudity or topless" },
];

/** The three top-level tabs. Mirrored in the URL as `?view=`. */
export type View = "search" | "shortlist" | "watched";

/** Minimal reference needed to open a title's detail view. */
export interface SelectionRef {
  id: number;
  mediaType: MediaType;
  /** Absent when restored from a URL, which carries only type + id. */
  title?: string;
}

// ---- Library (shortlist + watched log) ------------------------------------

export type LibraryStatus = "shortlist" | "watched";

export interface LibraryItem {
  id: number;
  mediaType: MediaType;
  title: string;
  year: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  voteCount: number;
  overview: string;
  imdbId: string | null;
  genres: string[];
  runtime: number | null;
  status: LibraryStatus;
  /** Personal rating, 1–5 stars (null = unrated). */
  userRating: number | null;
  notes: string;
  addedAt: number;
  watchedAt: number | null;
}

// ---- Configurable actions -------------------------------------------------

export type ActionType = "open-url" | "copy" | "deep-link" | "http-request";
export type ActionGroup = "download" | "search" | "record" | "custom";

/**
 * A user-defined action button. `template` may contain {placeholders} (see
 * lib/placeholders.ts) that are filled in from the selected title at run time.
 */
export interface ActionDef {
  id: string;
  name: string;
  /** lucide icon name — see lib/icons.tsx for the supported set. */
  icon: string;
  type: ActionType;
  group: ActionGroup;
  template: string;
  enabled: boolean;
  /** Ask for confirmation before firing (recommended for http-request). */
  confirm?: boolean;
  // http-request only:
  method?: "GET" | "POST";
  /** Raw "Key: Value" header lines, one per line. */
  headers?: string;
  body?: string;
}

/** A lightweight result from TMDB's multi-search, normalized across movie/tv. */
export interface SearchResult {
  id: number;
  mediaType: MediaType;
  title: string;
  year: string;
  /** Full YYYY-MM-DD, so date sorting doesn't tie every title in a year. */
  releaseDate: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  voteCount: number;
}

/** How search results are ordered. TMDB has no sort param for text search. */
export type SortOrder = "relevance" | "votes" | "rating" | "newest" | "oldest";

export interface Trailer {
  id: string;
  key: string; // YouTube video id
  name: string;
  type: string; // Trailer | Teaser | Clip | ...
  official: boolean;
}

export interface CastMember {
  /** TMDB person id — used to open their filmography. */
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

/** A person, with the titles they acted in. */
export interface PersonDetails {
  id: number;
  name: string;
  profilePath: string | null;
  /** e.g. "Acting", "Directing". */
  knownForDepartment: string;
  biography: string;
  /**
   * Acting credits, most-voted first. Deliberately SearchResult-shaped so the
   * existing result cards render them without a parallel component.
   */
  credits: SearchResult[];
}

export interface WatchProvider {
  id: number;
  name: string;
  logoPath: string | null;
}

/** Where a title can be watched in one country (data via JustWatch/TMDB). */
export interface CountryProviders {
  /** JustWatch "where to watch" page for this title + country. */
  link: string;
  flatrate: WatchProvider[]; // subscription streaming
  free: WatchProvider[];
  ads: WatchProvider[]; // free with ads
  rent: WatchProvider[];
  buy: WatchProvider[];
}

/** Fully hydrated details for a single title, normalized across movie/tv. */
export interface TitleDetails {
  id: number;
  mediaType: MediaType;
  title: string;
  originalTitle: string;
  year: string;
  releaseDate: string;
  overview: string;
  tagline: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  voteCount: number;
  runtime: number | null;
  genres: string[];
  spokenLanguages: string[];
  originalLanguage: string;
  status: string;
  /** TV only: date of the most recent episode aired. */
  lastAirDate: string;
  /** TV only: still producing new episodes. */
  inProduction: boolean;
  homepage: string | null;
  imdbId: string | null;
  /** Movie directors, or TV creators. */
  directors: string[];
  cast: CastMember[];
  trailers: Trailer[];
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  /** Watch availability keyed by ISO 3166-1 country code (e.g. "US"). */
  watchProviders: Record<string, CountryProviders>;
  /** Age certification by country, e.g. { US: "PG-13" }. */
  certifications: Record<string, string>;
}
