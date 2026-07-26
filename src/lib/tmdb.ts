import type {
  CastMember,
  CountryProviders,
  MediaType,
  SearchResult,
  TitleDetails,
  Trailer,
  WatchProvider,
} from "@/types";

const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export class TmdbError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "TmdbError";
    this.status = status;
  }
}

function buildUrl(
  path: string,
  apiKey: string,
  params: Record<string, string> = {},
): string {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("api_key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function tmdbFetch<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new TmdbError("Couldn't reach TMDB. Check your internet connection.");
  }
  if (!res.ok) {
    if (res.status === 401) {
      throw new TmdbError("Invalid TMDB API key — check it in Settings.", 401);
    }
    if (res.status === 404) throw new TmdbError("Not found on TMDB.", 404);
    if (res.status === 429) {
      throw new TmdbError("TMDB rate limit hit — try again in a moment.", 429);
    }
    throw new TmdbError(`TMDB request failed (${res.status}).`, res.status);
  }
  return (await res.json()) as T;
}

type PosterSize = "w185" | "w342" | "w500" | "w780" | "original";
type BackdropSize = "w780" | "w1280" | "original";

export function posterUrl(
  path: string | null,
  size: PosterSize = "w500",
): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

export function backdropUrl(
  path: string | null,
  size: BackdropSize = "w1280",
): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

export function providerLogoUrl(
  path: string | null,
  size: "w45" | "w92" = "w92",
): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

export function imdbUrl(imdbId: string): string {
  return `https://www.imdb.com/title/${imdbId}/`;
}

function yearOf(date?: string): string {
  return (date ?? "").slice(0, 4);
}

// ---- Search ---------------------------------------------------------------

interface RawSearchItem {
  id: number;
  media_type: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
}

export async function searchMulti(
  apiKey: string,
  query: string,
): Promise<SearchResult[]> {
  const data = await tmdbFetch<{ results: RawSearchItem[] }>(
    buildUrl("/search/multi", apiKey, {
      query,
      include_adult: "false",
      page: "1",
    }),
  );

  return data.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => ({
      id: r.id,
      mediaType: r.media_type as MediaType,
      title: r.title ?? r.name ?? "Untitled",
      year: yearOf(r.release_date ?? r.first_air_date),
      overview: r.overview ?? "",
      posterPath: r.poster_path ?? null,
      backdropPath: r.backdrop_path ?? null,
      voteAverage: r.vote_average ?? 0,
      voteCount: r.vote_count ?? 0,
    }));
}

// ---- Details --------------------------------------------------------------

interface RawDetails {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  tagline?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  status?: string;
  homepage?: string | null;
  original_language?: string;
  runtime?: number;
  release_date?: string;
  first_air_date?: string;
  last_air_date?: string;
  in_production?: boolean;
  imdb_id?: string;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres?: { id: number; name: string }[];
  spoken_languages?: { english_name: string; name: string }[];
  created_by?: { name: string }[];
  external_ids?: { imdb_id?: string | null };
  videos?: { results: RawVideo[] };
  credits?: { cast?: RawCast[]; crew?: RawCrew[] };
  "watch/providers"?: { results?: Record<string, RawCountryProviders> };
  /** Movies: certification lives inside each country's release dates. */
  release_dates?: {
    results?: { iso_3166_1: string; release_dates?: { certification?: string }[] }[];
  };
  /** TV: one rating per country. */
  content_ratings?: { results?: { iso_3166_1: string; rating?: string }[] };
}

interface RawProvider {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
}
interface RawCountryProviders {
  link: string;
  flatrate?: RawProvider[];
  free?: RawProvider[];
  ads?: RawProvider[];
  rent?: RawProvider[];
  buy?: RawProvider[];
}

interface RawVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}
interface RawCast {
  name: string;
  character?: string;
  profile_path?: string | null;
}
interface RawCrew {
  name: string;
  job?: string;
}

/** Rank YouTube trailers so the best official trailer surfaces first. */
function normalizeTrailers(videos?: RawVideo[]): Trailer[] {
  const youtube = (videos ?? []).filter((v) => v.site === "YouTube");
  const priority = (v: RawVideo) => {
    const typeRank = v.type === "Trailer" ? 0 : v.type === "Teaser" ? 1 : 2;
    return (v.official ? 0 : 0.5) + typeRank;
  };
  const preferred = youtube.filter((v) =>
    ["Trailer", "Teaser", "Clip"].includes(v.type),
  );
  return (preferred.length > 0 ? preferred : youtube)
    .sort((a, b) => priority(a) - priority(b))
    .map((v) => ({
      id: v.id,
      key: v.key,
      name: v.name,
      type: v.type,
      official: v.official,
    }));
}

function normalizeCast(cast?: RawCast[]): CastMember[] {
  return (cast ?? []).slice(0, 12).map((c) => ({
    name: c.name,
    character: c.character ?? "",
    profilePath: c.profile_path ?? null,
  }));
}

function toProviders(list?: RawProvider[]): WatchProvider[] {
  return (list ?? []).map((p) => ({
    id: p.provider_id,
    name: p.provider_name,
    logoPath: p.logo_path ?? null,
  }));
}

/** Flatten TMDB's two different certification shapes into country → rating. */
function normalizeCertifications(d: RawDetails): Record<string, string> {
  const out: Record<string, string> = {};

  for (const entry of d.release_dates?.results ?? []) {
    const cert = entry.release_dates?.find((r) => r.certification)?.certification;
    if (cert) out[entry.iso_3166_1] = cert;
  }
  for (const entry of d.content_ratings?.results ?? []) {
    if (entry.rating) out[entry.iso_3166_1] = entry.rating;
  }
  return out;
}

function normalizeWatchProviders(
  raw?: Record<string, RawCountryProviders>,
): Record<string, CountryProviders> {
  const out: Record<string, CountryProviders> = {};
  for (const [country, cp] of Object.entries(raw ?? {})) {
    out[country] = {
      link: cp.link,
      flatrate: toProviders(cp.flatrate),
      free: toProviders(cp.free),
      ads: toProviders(cp.ads),
      rent: toProviders(cp.rent),
      buy: toProviders(cp.buy),
    };
  }
  return out;
}

export async function getDetails(
  apiKey: string,
  mediaType: MediaType,
  id: number,
): Promise<TitleDetails> {
  // Certification lives under a different sub-resource per media type.
  const certResource =
    mediaType === "movie" ? "release_dates" : "content_ratings";

  const d = await tmdbFetch<RawDetails>(
    buildUrl(`/${mediaType}/${id}`, apiKey, {
      append_to_response: `videos,external_ids,credits,watch/providers,${certResource}`,
    }),
  );

  const directors =
    mediaType === "movie"
      ? (d.credits?.crew ?? [])
          .filter((c) => c.job === "Director")
          .map((c) => c.name)
      : (d.created_by ?? []).map((c) => c.name);

  return {
    id: d.id,
    mediaType,
    title: d.title ?? d.name ?? "Untitled",
    originalTitle: d.original_title ?? d.original_name ?? "",
    year: yearOf(d.release_date ?? d.first_air_date),
    releaseDate: d.release_date ?? d.first_air_date ?? "",
    overview: d.overview ?? "",
    tagline: d.tagline ?? "",
    posterPath: d.poster_path ?? null,
    backdropPath: d.backdrop_path ?? null,
    voteAverage: d.vote_average ?? 0,
    voteCount: d.vote_count ?? 0,
    runtime:
      mediaType === "movie"
        ? (d.runtime ?? null)
        : (d.episode_run_time?.[0] ?? null),
    genres: (d.genres ?? []).map((g) => g.name),
    spokenLanguages: (d.spoken_languages ?? []).map((l) => l.english_name),
    originalLanguage: d.original_language ?? "",
    status: d.status ?? "",
    lastAirDate: d.last_air_date ?? "",
    inProduction: d.in_production ?? false,
    homepage: d.homepage ?? null,
    imdbId: d.imdb_id ?? d.external_ids?.imdb_id ?? null,
    directors,
    cast: normalizeCast(d.credits?.cast),
    trailers: normalizeTrailers(d.videos?.results),
    numberOfSeasons: d.number_of_seasons ?? null,
    numberOfEpisodes: d.number_of_episodes ?? null,
    watchProviders: normalizeWatchProviders(d["watch/providers"]?.results),
    certifications: normalizeCertifications(d),
  };
}
