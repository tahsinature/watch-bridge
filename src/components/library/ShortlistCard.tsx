import { motion } from "framer-motion";
import { Check, Eye, Star, Trash2 } from "lucide-react";
import { PosterImage } from "@/components/ui/poster-image";
import { ContentLevelBadge } from "./ContentLevelBadge";
import { useIsOverLimit } from "./ContentLevelFilter";
import { useContentLevel } from "@/stores/content";
import { formatRating, formatVotes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LibraryItem } from "@/types";

interface ShortlistCardProps {
  item: LibraryItem;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onWatched: () => void;
  onRemove: () => void;
}

export function ShortlistCard({
  item,
  selected,
  onToggleSelect,
  onOpen,
  onWatched,
  onRemove,
}: ShortlistCardProps) {
  const rating = formatRating(item.voteAverage);
  const level = useContentLevel(item.id, item.mediaType);
  const overLimit = useIsOverLimit(level);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      title={overLimit ? "Above your content limit" : undefined}
      className={cn(
        "group relative flex flex-col overflow-hidden border bg-card shadow-md transition-colors",
        selected ? "border-primary ring-1 ring-primary" : "border-border",
        overLimit && "opacity-35 hover:opacity-100",
      )}
    >
      <button
        onClick={onOpen}
        className="relative aspect-[2/3] w-full overflow-hidden bg-secondary text-left"
      >
        <PosterImage
          path={item.posterPath}
          alt={item.title}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {rating && (
          <span
            className="absolute right-2 top-2 inline-flex items-center gap-1 border border-gold/30 bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-gold"
            title={`${item.voteCount.toLocaleString()} votes`}
          >
            <Star className="h-3 w-3 fill-gold text-gold" />
            {rating}
            {item.voteCount > 0 && (
              <span className="font-normal text-white/70">
                ({formatVotes(item.voteCount)})
              </span>
            )}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute bottom-2 right-2">
          <ContentLevelBadge id={item.id} mediaType={item.mediaType} />
        </span>
      </button>

      {/* Compare-selection toggle */}
      <button
        onClick={onToggleSelect}
        aria-label={selected ? "Deselect from compare" : "Select to compare"}
        className={cn(
          "absolute left-2 top-2 grid size-6 place-items-center border transition-colors",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-white/50 bg-black/60 text-transparent hover:border-white",
        )}
      >
        <Check className="h-3.5 w-3.5" />
      </button>

      <div className="flex flex-1 flex-col p-3">
        {/*
          A two-line title would otherwise push the year and buttons down on
          that card alone, breaking alignment across the row. mt-auto pins
          everything below the title to the card's bottom edge instead.
        */}
        <p
          className="line-clamp-2 text-sm font-semibold leading-snug"
          title={item.title}
        >
          {item.title}
        </p>
        <p className="mt-auto pt-1 text-xs text-muted-foreground">
          {item.year}
          {" · "}
          {item.mediaType === "tv" ? "Series" : "Film"}
        </p>

        <div className="mt-2.5 flex items-center gap-1.5">
          <button
            onClick={onWatched}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-secondary px-2 py-1.5 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Eye className="h-3.5 w-3.5" />
            Watched
          </button>
          <button
            onClick={onRemove}
            aria-label="Remove from shortlist"
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
