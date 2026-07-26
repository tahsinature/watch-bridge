import { motion } from "framer-motion";
import { Clapperboard, Tv } from "lucide-react";
import { PosterImage } from "@/components/ui/poster-image";
import { RatingBadge } from "@/components/ui/rating-badge";
import { ShortlistButton } from "@/components/library/ShortlistButton";
import { ContentLevelBadge } from "@/components/library/ContentLevelBadge";
import { useContentLimit } from "@/hooks/useContentLimit";
import { fromSearchResult } from "@/lib/library";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/types";

interface MovieCardProps {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}

export function MovieCard({ result, onSelect }: MovieCardProps) {
  const { tooltip, dimClass } = useContentLimit(result.id, result.mediaType);

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      title={tooltip}
      className={cn(
        "group relative flex flex-col overflow-hidden border border-border bg-card shadow-md transition-colors hover:border-primary/50",
        dimClass,
      )}
    >
      <button
        onClick={() => onSelect(result)}
        className="relative aspect-[2/3] w-full overflow-hidden bg-secondary text-left ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <PosterImage
          path={result.posterPath}
          alt={result.title}
          className="transition-transform duration-300 group-hover:scale-105"
        />

        <span className="absolute left-2 top-2 inline-flex items-center gap-1 border border-white/15 bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          {result.mediaType === "tv" ? (
            <Tv className="h-2.5 w-2.5" />
          ) : (
            <Clapperboard className="h-2.5 w-2.5" />
          )}
          {result.mediaType === "tv" ? "TV" : "Film"}
        </span>

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />

        <span className="absolute inset-x-2 bottom-2 flex items-end gap-1">
          <RatingBadge
            average={result.voteAverage}
            votes={result.voteCount}
            variant="overlay"
          />
          <span className="ml-auto">
            <ContentLevelBadge id={result.id} mediaType={result.mediaType} />
          </span>
        </span>
      </button>

      {/* Quick add to shortlist (kept outside the poster button) */}
      <div className="absolute right-2 top-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <ShortlistButton item={fromSearchResult(result)} />
      </div>

      <button
        onClick={() => onSelect(result)}
        className="flex flex-1 flex-col p-3 text-left"
      >
        {/* mt-auto keeps years aligned when a title wraps to two lines. */}
        <p
          className="line-clamp-2 text-sm font-semibold leading-snug"
          title={result.title}
        >
          {result.title}
        </p>
        {result.year && (
          <p className="mt-auto pt-1 text-xs text-muted-foreground">
            {result.year}
          </p>
        )}
      </button>
    </motion.div>
  );
}
