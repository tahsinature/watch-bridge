import { Loader2, Search, X } from "lucide-react";
import { RecentSearches } from "./RecentSearches";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}

export function SearchBar({ value, onChange, loading }: SearchBarProps) {
  return (
    <div className="overflow-hidden border border-input bg-background/60 shadow-lg transition-colors focus-within:border-ring/80 focus-within:ring-1 focus-within:ring-ring">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search a movie or series…"
          className="h-14 rounded-none border-0 bg-transparent pl-11 pr-11 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Search movies and series"
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      {value.length === 0 ? <RecentSearches onPick={onChange} /> : null}
    </div>
  );
}
