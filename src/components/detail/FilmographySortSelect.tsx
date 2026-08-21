import { ArrowDownWideNarrow } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FILMOGRAPHY_SORT_ORDERS,
  type FilmographySortOrder,
} from "@/lib/sort";

interface FilmographySortSelectProps {
  value: FilmographySortOrder;
  onChange: (value: FilmographySortOrder) => void;
}

/** Local filmography ordering; deliberately independent of search settings. */
export function FilmographySortSelect({
  value,
  onChange,
}: FilmographySortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowDownWideNarrow className="size-4 text-primary" />
      <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:inline">
        Order
      </span>
      <Select
        value={value}
        onValueChange={(nextValue) =>
          onChange(nextValue as FilmographySortOrder)
        }
      >
        <SelectTrigger
          aria-label="Sort filmography"
          className="h-8 w-[10.5rem] border-primary/30 bg-primary/5 text-xs"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FILMOGRAPHY_SORT_ORDERS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
