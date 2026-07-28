import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { MovieGrid } from "./MovieGrid";
import { RecentSearches } from "./RecentSearches";
import { RecentTitles } from "./RecentTitles";
import { SortSelect } from "./SortSelect";
import { EmptyState } from "@/components/ui/empty-state";
import { useSearch } from "@/hooks/useTmdb";
import { useDebounce } from "@/hooks/useDebounce";
import { toSelectionRef } from "@/lib/library";
import { sortResults } from "@/lib/sort";
import { useRecentSearches } from "@/stores/recent";
import { useRecentTitles } from "@/stores/recentTitles";
import { useSettings } from "@/stores/settings";
import type { SearchResult, SelectionRef } from "@/types";

const EXAMPLES = ["Dune", "Breaking Bad", "Oppenheimer", "The Bear", "Interstellar"];

export function SearchView({ onSelect }: { onSelect: (ref: SelectionRef) => void }) {
  const [input, setInput] = useState("");
  const query = useDebounce(input, 350);

  const { data, isLoading, isFetching, error } = useSearch(query);
  const hasQuery = query.trim().length > 1;

  const sortOrder = useSettings((s) => s.sortOrder);
  const results = useMemo(
    () => sortResults(data ?? [], sortOrder),
    [data, sortOrder],
  );

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

      {hasQuery && results.length > 0 && (
        <div className="flex flex-wrap justify-end gap-3">
          <SortSelect />
        </div>
      )}

      {hasQuery ? (
        <MovieGrid
          results={results}
          loading={isLoading}
          error={(error as Error) ?? null}
          query={query}
          onSelect={openResult}
        />
      ) : (
        <SearchHome onPick={setInput} onSelect={onSelect} />
      )}
    </div>
  );
}

/** The home screen: what you see before typing anything. */
function SearchHome({
  onPick,
  onSelect,
}: {
  onPick: (value: string) => void;
  onSelect: (ref: SelectionRef) => void;
}) {
  const hasRecentSearches = useRecentSearches((s) => s.queries.length > 0);
  const hasRecentTitles = useRecentTitles((s) => s.titles.length > 0);

  return (
    <EmptyState
      icon={Sparkles}
      title="Start typing to explore"
      detail="Search any film or series to see posters, trailers and quick facts."
      className="gap-8 py-14"
    >
      <RecentSearches onPick={onPick} />

      <RecentTitles onPick={(title) => onSelect(toSelectionRef(title))} />

      {/* Examples are training wheels — retire them once there's history. */}
      {!hasRecentSearches && !hasRecentTitles && (
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              onClick={() => onPick(example)}
              className="border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </EmptyState>
  );
}
