import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { MovieGrid } from "./MovieGrid";
import { RecentSearches } from "./RecentSearches";
import { RecentTitles } from "./RecentTitles";
import { ContentLevelFilter } from "@/components/library/ContentLevelFilter";
import { useSearch } from "@/hooks/useTmdb";
import { useDebounce } from "@/hooks/useDebounce";
import { useRecentSearches } from "@/stores/recent";
import { useRecentTitles } from "@/stores/recentTitles";
import type { SearchResult, SelectionRef } from "@/types";

const EXAMPLES = ["Dune", "Breaking Bad", "Oppenheimer", "The Bear", "Interstellar"];

export function SearchView({ onSelect }: { onSelect: (ref: SelectionRef) => void }) {
  const [input, setInput] = useState("");
  const query = useDebounce(input, 350);

  const { data, isLoading, isFetching, error } = useSearch(query);
  const hasQuery = query.trim().length > 1;

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
    onSelect({
      id: result.id,
      mediaType: result.mediaType,
      title: result.title,
    });
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

      {hasQuery && (data?.length ?? 0) > 0 && (
        <div className="flex justify-end">
          <ContentLevelFilter />
        </div>
      )}

      {hasQuery ? (
        <MovieGrid
          results={data ?? []}
          loading={isLoading}
          error={(error as Error) ?? null}
          query={query}
          onSelect={openResult}
        />
      ) : (
        <EmptyState onPick={setInput} onSelect={onSelect} />
      )}
    </div>
  );
}

function EmptyState({
  onPick,
  onSelect,
}: {
  onPick: (value: string) => void;
  onSelect: (ref: SelectionRef) => void;
}) {
  const hasRecentSearches = useRecentSearches((s) => s.queries.length > 0);
  const hasRecentTitles = useRecentTitles((s) => s.titles.length > 0);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-14 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="grid size-14 place-items-center border border-primary/30 bg-primary/10 text-primary">
          <Sparkles className="size-7" />
        </span>
        <div>
          <p className="text-lg font-semibold">Start typing to explore</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Search any film or series to see posters, trailers and quick facts.
          </p>
        </div>
      </div>

      <RecentSearches onPick={onPick} />

      <RecentTitles
        onPick={(title) =>
          onSelect({
            id: title.id,
            mediaType: title.mediaType,
            title: title.title,
          })
        }
      />

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
    </div>
  );
}
