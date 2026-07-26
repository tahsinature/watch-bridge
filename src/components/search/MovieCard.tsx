import { motion } from "framer-motion";
import { Clapperboard, Star, Tv } from "lucide-react";
import { PosterImage } from "@/components/ui/poster-image";
import { ShortlistButton } from "@/components/library/ShortlistButton";
import { ContentLevelBadge } from "@/components/library/ContentLevelBadge";
import { useIsOverLimit } from "@/components/library/ContentLevelFilter";
import { useContentLevel } from "@/stores/content";
import { formatRating, formatVotes } from "@/lib/format";
import { fromSearchResult } from "@/lib/library";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/types";

interface MovieCardProps {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}

export function MovieCard({ result, onSelect }: MovieCardProps) {
  const rating = formatRating(result.voteAverage);
  const level = useContentLevel(result.id, result.mediaType);
  const overLimit = useIsOverLimit(level);

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      title={overLimit ? "Above your content limit" : undefined}
      className={cn(
        "group relative flex flex-col overflow-hidden border border-border bg-card shadow-md transition-colors hover:border-primary/50",
        overLimit && "opacity-35 hover:opacity-100",
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

        <span className="absolute inset-x-2 bottom-2 flex items-end justify-between gap-1">
          {rating ? (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold"
              title={`${result.voteCount.toLocaleString()} votes`}
            >
              <Star className="size-3 fill-gold text-gold" />
              {rating}
              {result.voteCount > 0 && (
                /* White, not muted — this sits on the poster, not a surface. */
                <span className="font-normal text-white/70">
                  ({formatVotes(result.voteCount)})
                </span>
              )}
            </span>
          ) : (
            <span />
          )}
          <ContentLevelBadge id={result.id} mediaType={result.mediaType} />
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
        <p className="line-clamp-2 text-sm font-semibold leading-snug">
          {result.title}
        </p>
        {result.year && (
          <p className="mt-0.5 text-xs text-muted-foreground">{result.year}</p>
        )}
      </button>
    </motion.div>
  );
}
