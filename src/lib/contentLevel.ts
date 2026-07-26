import type { ContentLevel } from "@/types";

/** Colour per level, mirroring the user's Notion palette. */
export const LEVEL_STYLES: Record<
  ContentLevel,
  { chip: string; selected: string; dot: string; short: string }
> = {
  0: {
    chip: "border-sky-500/30 text-sky-300/80 hover:border-sky-500/60",
    selected: "border-sky-500 bg-sky-500/20 text-sky-200",
    dot: "bg-sky-400",
    short: "0",
  },
  1: {
    chip: "border-violet-500/30 text-violet-300/80 hover:border-violet-500/60",
    selected: "border-violet-500 bg-violet-500/20 text-violet-200",
    dot: "bg-violet-400",
    short: "1",
  },
  2: {
    chip: "border-stone-400/30 text-stone-300/80 hover:border-stone-400/60",
    selected: "border-stone-400 bg-stone-400/20 text-stone-100",
    dot: "bg-stone-300",
    short: "2",
  },
  3: {
    chip: "border-rose-400/30 text-rose-300/80 hover:border-rose-400/60",
    selected: "border-rose-400 bg-rose-400/20 text-rose-200",
    dot: "bg-rose-400",
    short: "3",
  },
};

/** IMDb's Parents Guide holds the "Sex & Nudity" severity this scale mirrors. */
export function parentsGuideUrl(imdbId: string): string {
  return `https://www.imdb.com/title/${imdbId}/parentalguide`;
}

/**
 * Certifications that mean "suitable for all ages" across the major boards.
 * These cannot contain nudity by definition of the rating, so they're the only
 * case we can infer safely.
 */
const ALL_AGES_CERTS = new Set([
  "G", // US / Canada / Australia / Ireland
  "TV-G",
  "TV-Y",
  "TV-Y7",
  "TV-Y7-FV",
  "U", // UK / India / France
  "UC",
  "0", // Germany FSK
  "AL", // Netherlands
  "TP", // Spain
  "ATP", // Argentina
]);

/**
 * Infer a level from certification — deliberately conservative. Ratings like
 * R, TV-MA and PG-13 say nothing specific about nudity (Titanic is PG-13 and
 * has some), so anything not clearly all-ages stays undetermined.
 */
export function deriveContentLevel(
  certifications: Record<string, string>,
  regions: string[],
): { level: ContentLevel; reason: string } | null {
  for (const country of [...regions, "US", "GB"]) {
    const cert = certifications[country];
    if (!cert) continue;
    // The first country with data decides, so the result stays predictable.
    return ALL_AGES_CERTS.has(cert.toUpperCase())
      ? { level: 0, reason: `${cert} rating (${country})` }
      : null;
  }
  return null;
}
