import { ExternalLink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LEVEL_STYLES,
  deriveContentLevel,
  parentsGuideUrl,
} from "@/lib/contentLevel";
import { useContentLevel, useContentLevels } from "@/stores/content";
import { useSettings } from "@/stores/settings";
import { cn } from "@/lib/utils";
import { CONTENT_LEVELS, type ContentLevel, type TitleDetails } from "@/types";

const UNKNOWN = "unknown";

/**
 * Shows a single resolved level rather than a row of choices. Falls back to a
 * safe inference from certification, then to "Unknown" — TMDB carries no
 * nudity data, so the Parents Guide link is always the way to find out.
 */
export function ContentLevelPicker({ details }: { details: TitleDetails }) {
  const userLevel = useContentLevel(details.id, details.mediaType);
  const setLevel = useContentLevels((s) => s.setLevel);
  const clearLevel = useContentLevels((s) => s.clearLevel);
  const regions = useSettings((s) => s.regions);

  const derived = deriveContentLevel(details.certifications, regions);
  const level = userLevel ?? derived?.level;
  const isDerived = userLevel === undefined && derived !== null;

  const styles = level !== undefined ? LEVEL_STYLES[level] : null;
  const option = CONTENT_LEVELS.find((o) => o.value === level);

  // Single wrapping row — the link doesn't warrant its own line.
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <Select
        value={level === undefined ? UNKNOWN : String(level)}
        onValueChange={(v) =>
          v === UNKNOWN
            ? clearLevel(details.id, details.mediaType)
            : setLevel(details.id, details.mediaType, Number(v) as ContentLevel)
        }
      >
        <SelectTrigger
          className={cn(
            "h-7 w-auto min-w-[10rem] gap-2 text-xs",
            styles ? styles.selected : "text-muted-foreground",
          )}
        >
          <SelectValue>{option?.label ?? "Unknown"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNKNOWN}>Unknown</SelectItem>
          {CONTENT_LEVELS.map((o) => (
            <SelectItem key={o.value} value={String(o.value)}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isDerived && (
        <span className="text-[11px] text-muted-foreground">
          inferred from {derived.reason}
        </span>
      )}

      {details.imdbId ? (
        <a
          href={parentsGuideUrl(details.imdbId)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          <ExternalLink className="size-3.5" />
          Check IMDb Parents Guide
        </a>
      ) : (
        <span className="text-[11px] text-muted-foreground">
          No IMDb id — Parents Guide unavailable.
        </span>
      )}
    </div>
  );
}
