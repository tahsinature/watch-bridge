import { SlidersHorizontal, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { MovieGrid } from "./MovieGrid";
import { PeopleResults } from "./PeopleResults";
import type { PersonSearchResult, SearchResult } from "@/types";

interface SearchResultsProps {
  people: PersonSearchResult[];
  titles: SearchResult[];
  loading: boolean;
  error: Error | null;
  query: string;
  usedFuzzyFallback: boolean;
  filteredEverything: boolean;
  filteredTitle: string;
  filteredDetail: string;
  onSelectPerson: (person: PersonSearchResult) => void;
  onSelectTitle: (title: SearchResult) => void;
}

export function SearchResults({
  people,
  titles,
  loading,
  error,
  query,
  usedFuzzyFallback,
  filteredEverything,
  filteredTitle,
  filteredDetail,
  onSelectPerson,
  onSelectTitle,
}: SearchResultsProps) {
  if (loading || error || (people.length === 0 && titles.length === 0)) {
    return (
      <MovieGrid
        results={titles}
        loading={loading}
        error={error}
        query={query}
        emptyTitle={filteredEverything ? filteredTitle : undefined}
        emptyDetail={
          filteredEverything
            ? filteredDetail
            : "Try another title, actor, director, or producer."
        }
        onSelect={onSelectTitle}
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {usedFuzzyFallback ? (
        <div
          role="status"
          className="flex items-start gap-3 border border-gold/35 bg-gold/[0.05] px-3.5 py-3 text-sm text-foreground/80"
        >
          <span className="grid size-7 shrink-0 place-items-center border border-gold/30 bg-gold/10 text-gold">
            <Sparkles className="size-3.5" aria-hidden="true" />
          </span>
          <span>
            <strong className="block text-xs uppercase tracking-wider text-gold">
              Closest matches
            </strong>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Spelling and word order were relaxed for “{query}”.
            </span>
          </span>
        </div>
      ) : null}

      {people.length > 0 ? (
        <PeopleResults people={people} onSelect={onSelectPerson} />
      ) : null}

      {titles.length > 0 ? (
        <section className="flex flex-col gap-2.5">
          <h2 className="eyebrow">Titles</h2>
          <MovieGrid
            results={titles}
            loading={false}
            error={null}
            query={query}
            onSelect={onSelectTitle}
          />
        </section>
      ) : filteredEverything ? (
        <section className="flex flex-col gap-2.5">
          <h2 className="eyebrow">Titles</h2>
          <EmptyState
            icon={SlidersHorizontal}
            title={filteredTitle}
            detail={filteredDetail}
            className="border border-border py-10"
          />
        </section>
      ) : null}
    </div>
  );
}
