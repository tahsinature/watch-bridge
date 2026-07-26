import { X } from "lucide-react";
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
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">Recent</p>
        <button
          onClick={clear}
          className="text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-destructive"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {queries.map((query) => (
          <span
            key={query}
            className="group inline-flex items-center border border-border bg-card transition-colors hover:border-primary/50"
          >
            <button
              onClick={() => onPick(query)}
              className="py-1.5 pl-3 pr-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground"
            >
              {query}
            </button>
            <button
              onClick={() => remove(query)}
              aria-label={`Remove ${query} from recent searches`}
              className="py-1.5 pr-2 text-muted-foreground/60 transition-colors hover:text-destructive"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
