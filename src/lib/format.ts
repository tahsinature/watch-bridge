/** "2h 14m", "48m", or null when unknown. */
export function formatRuntime(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/** One-decimal rating, or null when there are no votes yet. */
export function formatRating(voteAverage: number): string | null {
  return voteAverage > 0 ? voteAverage.toFixed(1) : null;
}

/** Compact vote count, e.g. 12500 -> "12.5k". */
export function formatVotes(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

/** Human-readable binary file size, e.g. 1843200 -> "1.8 MB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

/**
 * Release span. Movies show a single date; series show first → last air date,
 * or "→ ongoing" while still in production.
 */
export function formatReleaseSpan(details: {
  mediaType: "movie" | "tv";
  releaseDate: string;
  lastAirDate: string;
  inProduction: boolean;
  status: string;
}): string {
  if (details.mediaType === "movie") return details.releaseDate || "Unknown";

  const start = details.releaseDate || "?";
  const ongoing =
    details.inProduction || details.status === "Returning Series";
  if (ongoing) return `${start} → ongoing`;
  if (details.lastAirDate && details.lastAirDate !== start) {
    return `${start} → ${details.lastAirDate}`;
  }
  return start;
}

/** Safe filename for downloads, e.g. "Dune (2021).jpg". */
export function posterFilename(title: string, year: string): string {
  const base = `${title}${year ? ` (${year})` : ""}`.replace(
    /[^a-z0-9()\- ]/gi,
    "",
  );
  return `${base || "poster"}.jpg`;
}
