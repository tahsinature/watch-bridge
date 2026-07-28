export type MediaType = "movie" | "tv";

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
  /** TMDB's broad adult-title classification; not a nudity assessment. */
  adult: boolean;
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
  /** TMDB's broad adult-title classification; not a nudity assessment. */
  adult: boolean;
}

/** Official TMDB genre entry for either movies or TV. */
export interface Genre {
  id: number;
  name: string;
}

/** How search results are ordered. TMDB has no sort param for text search. */
export type SortOrder = "relevance" | "votes" | "rating" | "newest" | "oldest";

/** Persisted lower bound used to hide titles with very little audience data. */
export type MinimumVotes = 0 | 100 | 500 | 1_000 | 5_000;

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
  /** TMDB's broad adult-title classification; not a nudity assessment. */
  adult: boolean;
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
  /** TMDB recommendations returned alongside the title details. */
  recommendations: SearchResult[];
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  /** Watch availability keyed by ISO 3166-1 country code (e.g. "US"). */
  watchProviders: Record<string, CountryProviders>;
  /** Age certification by country, e.g. { US: "PG-13" }. */
  certifications: Record<string, string>;
}
