import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { PosterImage } from "@/components/ui/poster-image";
import type { SearchResult } from "@/types";

export function TitleResultCommands({
  results,
  searching,
  onSelect,
}: {
  results: SearchResult[];
  searching: boolean;
  onSelect: (result: SearchResult) => void;
}) {
  if (results.length === 0) return null;

  return (
    <>
      <CommandSeparator />
      <CommandGroup heading={searching ? "Searching titles…" : "Titles"}>
        {results.map((result) => (
          <CommandItem
            key={`${result.mediaType}-${result.id}`}
            value={`title ${result.title} ${result.year} ${result.mediaType}`}
            onSelect={() => onSelect(result)}
            className="py-2.5"
          >
            <div className="size-10 shrink-0 overflow-hidden border border-border bg-secondary">
              <PosterImage path={result.posterPath} alt="" size="w185" />
            </div>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate font-medium">{result.title}</span>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground group-data-[selected=true]:text-primary-foreground/75">
                {result.mediaType === "tv" ? "Series" : "Film"}
                {result.year ? ` · ${result.year}` : ""}
              </span>
            </span>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  );
}
