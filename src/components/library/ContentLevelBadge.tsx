import { LEVEL_STYLES } from "@/lib/contentLevel";
import { useContentLevel } from "@/stores/content";
import { cn } from "@/lib/utils";
import { CONTENT_LEVELS, type MediaType } from "@/types";

/** Compact level marker for grid cards; renders nothing until rated. */
export function ContentLevelBadge({
  id,
  mediaType,
  className,
}: {
  id: number;
  mediaType: MediaType;
  className?: string;
}) {
  const level = useContentLevel(id, mediaType);
  if (level === undefined) return null;

  const styles = LEVEL_STYLES[level];
  const option = CONTENT_LEVELS.find((o) => o.value === level);

  return (
    <span
      title={option?.label}
      className={cn(
        "inline-flex items-center gap-1 border bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold",
        styles.selected,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", styles.dot)} />
      {styles.short}
    </span>
  );
}
