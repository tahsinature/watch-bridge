import { useEffect, useMemo, useState } from "react";
import { SearchBar } from "./SearchBar";
import { ExploreHome } from "./ExploreHome";
import { MinimumVotesSelect } from "./MinimumVotesSelect";
import { RecentTitles } from "./RecentTitles";
import { SearchResults } from "./SearchResults";
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
import type {
  PersonSearchResult,
  PersonSelection,
  SearchResult,
  SelectionRef,
} from "@/types";

export function SearchView({
  onSelect,
  onSelectPerson,
}: {
  onSelect: (ref: SelectionRef) => void;
  onSelectPerson: (person: PersonSelection) => void;
}) {
  const [input, setInput] = useState("");
  const query = useDebounce(input, 350);

  const { data, isLoading, isFetching, error } = useSearch(query);
  const hasQuery = query.trim().length > 1;

  const sortOrder = useSettings((s) => s.sortOrder);
  const minimumVotes = useSettings((s) => s.minimumVotes);
  const results = useMemo(
    () =>
      sortResults(
        filterByMinimumVotes(data?.titles ?? [], minimumVotes),
        sortOrder,
      ),
    [data?.titles, minimumVotes, sortOrder],
  );
  const filteredEverything =
    minimumVotes > 0 &&
    (data?.titles.length ?? 0) > 0 &&
    results.length === 0;

  // Only remember searches that actually found something.
  const record = useRecentSearches((s) => s.record);
  useEffect(() => {
    if (data && (data.titles.length > 0 || data.people.length > 0)) {
      record(query);
    }
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

  const openPerson = (person: PersonSearchResult) => {
    onSelectPerson({ id: person.id, creditMode: person.creditMode });
  };

  const hasTitleMatches = (data?.titles.length ?? 0) > 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="w-full">
        <SearchBar
          value={input}
          onChange={setInput}
          loading={isFetching && hasQuery}
        />
      </div>

      {hasQuery && (isLoading || hasTitleMatches) ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <MinimumVotesSelect />
          {hasTitleMatches ? <SortSelect /> : null}
        </div>
      ) : null}

      {hasQuery ? (
        <SearchResults
          people={data?.people ?? []}
          titles={results}
          loading={isLoading}
          error={(error as Error) ?? null}
          query={query}
          usedFuzzyFallback={data?.usedFuzzyFallback ?? false}
          filteredEverything={filteredEverything}
          filteredTitle={`No titles with ${minimumVotesLabel(minimumVotes)} votes`}
          filteredDetail="Lower the minimum vote count to include newer or niche titles."
          onSelectPerson={openPerson}
          onSelectTitle={openResult}
        />
      ) : (
        <SearchHome
          onSelectResult={openResult}
          onSelectTitle={onSelect}
        />
      )}
    </div>
  );
}

/** The home screen: what you see before typing anything. */
function SearchHome({
  onSelectResult,
  onSelectTitle,
}: {
  onSelectResult: (result: SearchResult) => void;
  onSelectTitle: (ref: SelectionRef) => void;
}) {
  const hasRecentTitles = useRecentTitles((s) => s.titles.length > 0);

  return (
    <div className="flex flex-col gap-10">
      {hasRecentTitles && (
        <div className="w-full">
          <RecentTitles
            onPick={(title) => onSelectTitle(toSelectionRef(title))}
          />
        </div>
      )}

      <ExploreHome onSelect={onSelectResult} />
    </div>
  );
}
