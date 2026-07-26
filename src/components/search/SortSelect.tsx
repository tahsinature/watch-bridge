import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_ORDERS } from "@/lib/sort";
import { useSettings } from "@/stores/settings";
import type { SortOrder } from "@/types";

/** Orders the current result set. The choice sticks across sessions. */
export function SortSelect() {
  const sortOrder = useSettings((s) => s.sortOrder);
  const setSortOrder = useSettings((s) => s.setSortOrder);

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="size-4 text-muted-foreground" />
      <Select
        value={sortOrder}
        onValueChange={(value) => setSortOrder(value as SortOrder)}
      >
        <SelectTrigger className="h-8 w-auto min-w-[9rem] gap-2 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_ORDERS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
