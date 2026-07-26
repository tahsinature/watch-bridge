import { ShieldCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/stores/settings";
import { CONTENT_LEVELS, type ContentLevel } from "@/types";

const OFF = "off";

/** Sets the highest acceptable content level; titles above it are dimmed. */
export function ContentLevelFilter() {
  const maxLevel = useSettings((s) => s.maxContentLevel);
  const setMaxLevel = useSettings((s) => s.setMaxContentLevel);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
      <Select
        value={maxLevel === null ? OFF : String(maxLevel)}
        onValueChange={(v) =>
          setMaxLevel(v === OFF ? null : (Number(v) as ContentLevel))
        }
      >
        {/* Full label needs ~11rem; below sm it shrinks and truncates instead. */}
        <SelectTrigger className="h-8 w-auto min-w-0 max-w-full gap-2 text-xs sm:min-w-[11rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={OFF}>No limit</SelectItem>
          {CONTENT_LEVELS.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              Max {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
