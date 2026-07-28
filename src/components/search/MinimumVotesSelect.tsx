import { ListFilter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MINIMUM_VOTE_OPTIONS } from "@/lib/voteFilter";
import { useSettings } from "@/stores/settings";
import type { MinimumVotes } from "@/types";

/** One persisted audience-size filter shared by Search and Explore. */
export function MinimumVotesSelect() {
  const minimumVotes = useSettings((state) => state.minimumVotes);
  const setMinimumVotes = useSettings((state) => state.setMinimumVotes);

  return (
    <div className="inline-flex h-9 items-center border border-border bg-secondary/40">
      <span className="inline-flex items-center gap-1.5 px-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <ListFilter className="size-3.5" />
        <span className="hidden sm:inline">Min votes</span>
      </span>

      <Select
        value={String(minimumVotes)}
        onValueChange={(value) =>
          setMinimumVotes(Number(value) as MinimumVotes)
        }
      >
        <SelectTrigger
          aria-label="Minimum TMDB vote count"
          className="h-7 w-[5.25rem] rounded-none border-y-0 border-r-0 bg-transparent px-2 text-xs font-medium focus:ring-1 focus:ring-inset"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MINIMUM_VOTE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
