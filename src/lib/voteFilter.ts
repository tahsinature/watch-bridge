import type { MinimumVotes, SearchResult } from "@/types";

export const DEFAULT_MINIMUM_VOTES: MinimumVotes = 0;

export const MINIMUM_VOTE_OPTIONS: {
  value: MinimumVotes;
  label: string;
}[] = [
  { value: 0, label: "All" },
  { value: 100, label: "100+" },
  { value: 500, label: "500+" },
  { value: 1_000, label: "1K+" },
  { value: 5_000, label: "5K+" },
];

export function isMinimumVotes(value: unknown): value is MinimumVotes {
  return MINIMUM_VOTE_OPTIONS.some((option) => option.value === value);
}

export function filterByMinimumVotes(
  results: SearchResult[],
  minimumVotes: MinimumVotes,
): SearchResult[] {
  if (minimumVotes === 0) return results;
  return results.filter((result) => result.voteCount >= minimumVotes);
}

export function minimumVotesLabel(minimumVotes: MinimumVotes): string {
  return (
    MINIMUM_VOTE_OPTIONS.find((option) => option.value === minimumVotes)?.label ??
    "All"
  );
}
