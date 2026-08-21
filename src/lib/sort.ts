import type { SearchResult, SortOrder } from "@/types";

export type FilmographySortOrder = Exclude<SortOrder, "relevance">;

/** Default first — the dropdown leads with what you'll see out of the box. */
export const SORT_ORDERS: { value: SortOrder; label: string }[] = [
  { value: "votes", label: "Most voted" },
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Best rated" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

/** Person credits are complete lists, so relevance is not meaningful here. */
export const FILMOGRAPHY_SORT_ORDERS: {
  value: FilmographySortOrder;
  label: string;
}[] = [
  { value: "newest", label: "Latest release" },
  { value: "votes", label: "Most voted" },
  { value: "rating", label: "Best rated" },
  { value: "oldest", label: "Oldest release" },
];

/**
 * Votes a title needs before its own average outweighs the pool mean. Low
 * enough that a genuinely popular title ranks on its merits, high enough that
 * a 10.0 from four people can't top the list.
 */
const VOTE_THRESHOLD = 100;

/**
 * What an unproven title is assumed to be worth — roughly TMDB's mean across
 * all titles. Deliberately a fixed number rather than the mean of the current
 * results: a per-page mean rises to meet a strong result set and stops
 * demoting anything, and it would make a title's rank depend on whichever
 * others happened to come back with it.
 */
const PRIOR_RATING = 6.5;

/**
 * Bayesian average — the same shape IMDb's Top 250 and TMDB's own top-rated
 * list use. Titles with few votes are pulled toward the prior, so the ranking
 * reflects confidence rather than raw score.
 */
function weightedRating(result: SearchResult): number {
  const votes = result.voteCount;
  const confidence = votes / (votes + VOTE_THRESHOLD);
  return confidence * result.voteAverage + (1 - confidence) * PRIOR_RATING;
}

/** Undated titles sort last in both directions, rather than clumping at year 0. */
function compareDates(a: string, b: string, newestFirst: boolean): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return newestFirst ? b.localeCompare(a) : a.localeCompare(b);
}

type Comparator = (a: SearchResult, b: SearchResult) => number;

/**
 * Reorder one page of search results. "Relevance" is TMDB's own ordering, so
 * it's returned untouched — note every other order only ranks the ~20 results
 * TMDB returned, not every title matching the query.
 */
export function sortResults(
  results: SearchResult[],
  order: SortOrder,
): SearchResult[] {
  if (order === "relevance") return results;

  const comparators: Record<Exclude<SortOrder, "relevance">, Comparator> = {
    votes: (a, b) => b.voteCount - a.voteCount,
    rating: (a, b) => weightedRating(b) - weightedRating(a),
    newest: (a, b) => compareDates(a.releaseDate, b.releaseDate, true),
    oldest: (a, b) => compareDates(a.releaseDate, b.releaseDate, false),
  };

  return [...results].sort(comparators[order]);
}

/** YYYY-MM-DD in the viewer's timezone, matching how release dates are shown. */
export function localDateKey(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isUpcomingRelease(
  releaseDate: string,
  today = localDateKey(),
): boolean {
  return releaseDate !== "" && releaseDate > today;
}

/**
 * "Latest" puts the next upcoming projects first (nearest date first), then
 * released work newest-first, and finally credits without a known date.
 */
export function sortFilmographyResults(
  results: SearchResult[],
  order: FilmographySortOrder,
  today = localDateKey(),
): SearchResult[] {
  if (order !== "newest") return sortResults(results, order);

  const releaseGroup = (releaseDate: string) => {
    if (!releaseDate) return 2;
    return isUpcomingRelease(releaseDate, today) ? 0 : 1;
  };

  return [...results].sort((a, b) => {
    const groupDifference =
      releaseGroup(a.releaseDate) - releaseGroup(b.releaseDate);
    if (groupDifference !== 0) return groupDifference;

    const bothUpcoming = isUpcomingRelease(a.releaseDate, today);
    const dateDifference = bothUpcoming
      ? a.releaseDate.localeCompare(b.releaseDate)
      : b.releaseDate.localeCompare(a.releaseDate);

    return dateDifference || b.voteCount - a.voteCount;
  });
}
