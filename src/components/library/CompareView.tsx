import { Clock, Star, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PosterImage } from "@/components/ui/poster-image";
import { StarRating } from "@/components/ui/star-rating";
import { useDetails } from "@/hooks/useTmdb";
import { formatRating, formatRuntime } from "@/lib/format";
import type { LibraryItem } from "@/types";

interface CompareViewProps {
  items: LibraryItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveItem: (item: LibraryItem) => void;
  onOpenDetail: (item: LibraryItem) => void;
}

export function CompareView({
  items,
  open,
  onOpenChange,
  onRemoveItem,
  onOpenDetail,
}: CompareViewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[min(92vw,64rem)] max-w-none gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border p-5">
          <DialogTitle>Compare {items.length} titles</DialogTitle>
          <DialogDescription>
            Side by side — pick what to watch next.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 overflow-x-auto p-5 scrollbar-thin">
          {items.map((item) => (
            <CompareColumn
              key={`${item.mediaType}-${item.id}`}
              item={item}
              onRemove={() => onRemoveItem(item)}
              onOpen={() => onOpenDetail(item)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CompareColumn({
  item,
  onRemove,
  onOpen,
}: {
  item: LibraryItem;
  onRemove: () => void;
  onOpen: () => void;
}) {
  const { data } = useDetails(item.mediaType, item.id, true);
  const genres = data?.genres.length ? data.genres : item.genres;
  const runtime = formatRuntime(data?.runtime ?? item.runtime);
  const overview = data?.overview || item.overview;
  const rating = formatRating(item.voteAverage);

  return (
    <div className="relative flex w-56 shrink-0 flex-col rounded-xl border border-border bg-secondary/20">
      <button
        onClick={onRemove}
        aria-label="Remove from comparison"
        className="absolute right-2 top-2 z-10 grid size-6 place-items-center border border-white/15 bg-black/70 text-white/80 transition-colors hover:border-destructive hover:text-destructive"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={onOpen}
        className="aspect-[2/3] w-full overflow-hidden rounded-t-xl bg-secondary"
      >
        <PosterImage path={item.posterPath} alt={item.title} />
      </button>

      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div>
          <p className="line-clamp-2 text-sm font-semibold leading-snug">
            {item.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.year} · {item.mediaType === "tv" ? "Series" : "Film"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {rating && (
            <span className="inline-flex items-center gap-1 font-semibold text-gold">
              <Star className="h-3.5 w-3.5 fill-gold" />
              {rating}
            </span>
          )}
          {runtime && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {runtime}
            </span>
          )}
        </div>

        {item.userRating != null && (
          <div>
            <p className="mb-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Your rating
            </p>
            <StarRating value={item.userRating} size="sm" />
          </div>
        )}

        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {genres.slice(0, 3).map((g) => (
              <Badge key={g} variant="outline" className="px-1.5 py-0 text-[10px]">
                {g}
              </Badge>
            ))}
          </div>
        )}

        {overview && (
          <p className="line-clamp-5 text-xs leading-relaxed text-muted-foreground">
            {overview}
          </p>
        )}
      </div>
    </div>
  );
}
