import { AlertCircle, SearchX } from "lucide-react";
import { MovieCard } from "./MovieCard";
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
      <StateMessage
        icon={<AlertCircle className="h-8 w-8 text-destructive" />}
        title="Something went wrong"
        detail={error.message}
      />
    );
  }

  if (query.trim().length > 1 && results.length === 0) {
    return (
      <StateMessage
        icon={<SearchX className="h-8 w-8 text-muted-foreground" />}
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

function StateMessage({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
        {icon}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
