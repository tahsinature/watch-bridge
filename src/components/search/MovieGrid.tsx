import { AlertCircle, SearchX } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchResult } from "@/types";

interface MovieGridProps {
  results: SearchResult[];
  loading: boolean;
  error: Error | null;
  query: string;
  onSelect: (result: SearchResult) => void;
}

const gridClass =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

export function MovieGrid({
  results,
  loading,
  error,
  query,
  onSelect,
}: MovieGridProps) {
  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        tone="error"
        title="Something went wrong"
        detail={error.message}
      />
    );
  }

  if (query.trim().length > 1 && results.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={`No results for "${query}"`}
        detail="Try a different spelling or a shorter title."
      />
    );
  }

  return (
    <div className={gridClass}>
      {results.map((result) => (
        <MovieCard
          key={`${result.mediaType}-${result.id}`}
          result={result}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
