import { backdropUrl, posterUrl } from "@/lib/tmdb";
import type { TitleDetails } from "@/types";

/**
 * Values available to action templates for the currently selected title.
 * These are the "raw" values; the resolver also derives encoded variants.
 */
export interface ActionContext {
  imdbId: string;
  tmdbId: string;
  title: string;
  originalTitle: string;
  year: string;
  type: string; // "movie" | "tv"
  rating: string;
  homepage: string;
  posterUrl: string;
  backdropUrl: string;
}

/** Placeholders shown in the editor. `{clipboard}` is resolved at click time. */
export const PLACEHOLDERS: { token: string; description: string }[] = [
  { token: "{imdbId}", description: "IMDb id, e.g. tt0137523" },
  { token: "{tmdbId}", description: "TMDB numeric id" },
  { token: "{title}", description: "Title (raw)" },
  { token: "{titleEncoded}", description: "Title, URL-encoded" },
  { token: "{query}", description: "Alias of titleEncoded" },
  { token: "{originalTitle}", description: "Original-language title" },
  { token: "{year}", description: "Release year" },
  { token: "{type}", description: "movie or tv" },
  { token: "{rating}", description: "TMDB rating, e.g. 8.4" },
  { token: "{homepage}", description: "Official homepage URL" },
  { token: "{posterUrl}", description: "Full poster image URL" },
  { token: "{backdropUrl}", description: "Full backdrop image URL" },
  { token: "{clipboard}", description: "Current clipboard text (e.g. a magnet you copied)" },
  { token: "{clipboardEncoded}", description: "Clipboard text, URL-encoded" },
];

export function buildContext(details: TitleDetails): ActionContext {
  return {
    imdbId: details.imdbId ?? "",
    tmdbId: String(details.id),
    title: details.title,
    originalTitle: details.originalTitle || details.title,
    year: details.year,
    type: details.mediaType,
    rating: details.voteAverage > 0 ? details.voteAverage.toFixed(1) : "",
    homepage: details.homepage ?? "",
    posterUrl: posterUrl(details.posterPath, "original") ?? "",
    backdropUrl: backdropUrl(details.backdropPath, "original") ?? "",
  };
}

/**
 * Fill {placeholders} in a template. Async because `{clipboard}` reads the
 * system clipboard on demand (needed for the "copy magnet → send to NAS" flow).
 */
export async function resolveTemplate(
  template: string,
  ctx: ActionContext,
): Promise<string> {
  let result = template;

  if (result.includes("{clipboard")) {
    let clip = "";
    try {
      clip = await navigator.clipboard.readText();
    } catch {
      clip = "";
    }
    result = result
      .replaceAll("{clipboardEncoded}", encodeURIComponent(clip))
      .replaceAll("{clipboard}", clip);
  }

  const map: Record<string, string> = {
    imdbId: ctx.imdbId,
    tmdbId: ctx.tmdbId,
    title: ctx.title,
    titleEncoded: encodeURIComponent(ctx.title),
    query: encodeURIComponent(ctx.title),
    originalTitle: ctx.originalTitle,
    year: ctx.year,
    type: ctx.type,
    rating: ctx.rating,
    homepage: ctx.homepage,
    posterUrl: ctx.posterUrl,
    backdropUrl: ctx.backdropUrl,
  };

  for (const [key, value] of Object.entries(map)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}
