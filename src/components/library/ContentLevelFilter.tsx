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
    <div className="flex items-center gap-2">
      <ShieldCheck className="size-4 text-muted-foreground" />
      <Select
        value={maxLevel === null ? OFF : String(maxLevel)}
        onValueChange={(v) =>
          setMaxLevel(v === OFF ? null : (Number(v) as ContentLevel))
        }
      >
        <SelectTrigger className="h-8 w-auto min-w-[11rem] gap-2 text-xs">
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

/** True when a rated title exceeds the configured limit. */
export function useIsOverLimit(level: ContentLevel | undefined): boolean {
  const maxLevel = useSettings((s) => s.maxContentLevel);
  return maxLevel !== null && level !== undefined && level > maxLevel;
}
