import { useEffect, useMemo, useState } from "react";
import { SearchBar } from "./SearchBar";
import { ExploreHome } from "./ExploreHome";
import { MinimumVotesSelect } from "./MinimumVotesSelect";
import { MovieGrid } from "./MovieGrid";
import { RecentSearches } from "./RecentSearches";
import { RecentTitles } from "./RecentTitles";
import { SortSelect } from "./SortSelect";
import { useSearch } from "@/hooks/useTmdb";
import { useDebounce } from "@/hooks/useDebounce";
import { toSelectionRef } from "@/lib/library";
import { sortResults } from "@/lib/sort";
import {
  filterByMinimumVotes,
  minimumVotesLabel,
} from "@/lib/voteFilter";
import { useRecentSearches } from "@/stores/recent";
import { useRecentTitles } from "@/stores/recentTitles";
import { useSettings } from "@/stores/settings";
import type { SearchResult, SelectionRef } from "@/types";

export function SearchView({ onSelect }: { onSelect: (ref: SelectionRef) => void }) {
  const [input, setInput] = useState("");
  const query = useDebounce(input, 350);

  const { data, isLoading, isFetching, error } = useSearch(query);
  const hasQuery = query.trim().length > 1;

  const sortOrder = useSettings((s) => s.sortOrder);
  const minimumVotes = useSettings((s) => s.minimumVotes);
  const results = useMemo(
    () =>
      sortResults(
        filterByMinimumVotes(data ?? [], minimumVotes),
        sortOrder,
      ),
    [data, minimumVotes, sortOrder],
  );
  const filteredEverything =
    minimumVotes > 0 && (data?.length ?? 0) > 0 && results.length === 0;

  // Only remember searches that actually found something.
  const record = useRecentSearches((s) => s.record);
  useEffect(() => {
    if (data && data.length > 0) record(query);
  }, [data, query, record]);

  const recordTitle = useRecentTitles((s) => s.record);
  const openResult = (result: SearchResult) => {
    recordTitle({
      id: result.id,
      mediaType: result.mediaType,
      title: result.title,
      year: result.year,
      posterPath: result.posterPath,
    });
    onSelect(toSelectionRef(result));
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="mx-auto w-full max-w-2xl">
        <SearchBar
          value={input}
          onChange={setInput}
          loading={isFetching && hasQuery}
        />
      </div>

      {hasQuery && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <MinimumVotesSelect />
          {(data?.length ?? 0) > 0 && <SortSelect />}
        </div>
      )}

      {hasQuery ? (
        <MovieGrid
          results={results}
          loading={isLoading}
          error={(error as Error) ?? null}
          query={query}
          emptyTitle={
            filteredEverything
              ? `No titles with ${minimumVotesLabel(minimumVotes)} votes`
              : undefined
          }
          emptyDetail={
            filteredEverything
              ? "Lower the minimum vote count to include newer or niche titles."
              : undefined
          }
          onSelect={openResult}
        />
      ) : (
        <SearchHome
          onPick={setInput}
          onSelectResult={openResult}
          onSelectTitle={onSelect}
        />
      )}
    </div>
  );
}

/** The home screen: what you see before typing anything. */
function SearchHome({
  onPick,
  onSelectResult,
  onSelectTitle,
}: {
  onPick: (value: string) => void;
  onSelectResult: (result: SearchResult) => void;
  onSelectTitle: (ref: SelectionRef) => void;
}) {
  const hasRecentSearches = useRecentSearches((s) => s.queries.length > 0);
  const hasRecentTitles = useRecentTitles((s) => s.titles.length > 0);
  const hasHistory = hasRecentSearches || hasRecentTitles;

  return (
    <div className="flex flex-col gap-10">
      {hasHistory && (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <RecentSearches onPick={onPick} />
          <RecentTitles
            onPick={(title) => onSelectTitle(toSelectionRef(title))}
          />
        </div>
      )}

      <ExploreHome onSelect={onSelectResult} />
    </div>
  );
}
