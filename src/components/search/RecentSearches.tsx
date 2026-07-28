import { History, X } from "lucide-react";
import { useRecentSearches } from "@/stores/recent";

interface RecentSearchesProps {
  onPick: (query: string) => void;
}

/** Recently searched queries, newest first. Hidden until there's history. */
export function RecentSearches({ onPick }: RecentSearchesProps) {
  const queries = useRecentSearches((s) => s.queries);
  const remove = useRecentSearches((s) => s.remove);
  const clear = useRecentSearches((s) => s.clear);

  if (queries.length === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 border-t border-border px-2.5 py-2"
      aria-label="Recent searches"
    >
      <span className="mr-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <History className="size-3.5" />
        Recent
      </span>

      {queries.map((query) => (
        <span
          key={query}
          className="group inline-flex min-w-0 items-center border border-border bg-card/70 transition-colors hover:border-primary/50"
        >
          <button
            type="button"
            onClick={() => onPick(query)}
            title={query}
            className="max-w-36 truncate py-1 pl-2.5 pr-1.5 text-xs text-muted-foreground transition-colors group-hover:text-foreground sm:max-w-44"
          >
            {query}
          </button>
          <button
            type="button"
            onClick={() => remove(query)}
            aria-label={`Remove ${query} from recent searches`}
            className="py-1 pr-2 text-muted-foreground/50 transition-colors hover:text-destructive"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={clear}
        className="ml-auto px-1.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-destructive"
      >
        Clear
      </button>
    </div>
  );
}
