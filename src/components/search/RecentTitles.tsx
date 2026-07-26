import { X } from "lucide-react";
import { PosterImage } from "@/components/ui/poster-image";
import { useRecentTitles, type RecentTitle } from "@/stores/recentTitles";
import { itemKey } from "@/lib/library";

interface RecentTitlesProps {
  onPick: (title: RecentTitle) => void;
}

/** Titles recently opened from search, newest first. Hidden until there's history. */
export function RecentTitles({ onPick }: RecentTitlesProps) {
  const titles = useRecentTitles((s) => s.titles);
  const remove = useRecentTitles((s) => s.remove);
  const clear = useRecentTitles((s) => s.clear);

  if (titles.length === 0) return null;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">Recently viewed</p>
        <button
          onClick={clear}
          className="text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-destructive"
        >
          Clear all
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {titles.map((title) => (
          <RecentTitleCard
            key={itemKey(title.id, title.mediaType)}
            title={title}
            onPick={() => onPick(title)}
            onRemove={() => remove(title.id, title.mediaType)}
          />
        ))}
      </div>
    </div>
  );
}

function RecentTitleCard({
  title,
  onPick,
  onRemove,
}: {
  title: RecentTitle;
  onPick: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="group relative w-20 shrink-0">
      <button
        onClick={onPick}
        className="relative block aspect-[2/3] w-full overflow-hidden border border-border bg-secondary transition-colors hover:border-primary/50"
      >
        <PosterImage path={title.posterPath} alt={title.title} size="w185" />
      </button>

      {/* Reveal on hover so the row stays calm at rest. */}
      <button
        onClick={onRemove}
        aria-label={`Remove ${title.title} from recently viewed`}
        className="absolute right-1 top-1 grid size-5 place-items-center border border-white/20 bg-black/70 text-white/70 opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
      >
        <X className="size-3" />
      </button>

      <p className="mt-1.5 line-clamp-2 text-left text-[11px] font-medium leading-tight">
        {title.title}
      </p>
      {title.year && (
        <p className="text-left text-[10px] text-muted-foreground">{title.year}</p>
      )}
    </div>
  );
}
