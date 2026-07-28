import { Clapperboard } from "lucide-react";
import { AdultBadge } from "@/components/ui/adult-badge";
import { RatingBadge } from "@/components/ui/rating-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSimilarTitles } from "@/hooks/useTmdb";
import { toSelectionRef } from "@/lib/library";
import { backdropUrl, posterUrl } from "@/lib/tmdb";
import type { SearchResult, SelectionRef, TitleDetails } from "@/types";

const MAX_TITLES = 6;

interface TitleRecommendationsProps {
  details: TitleDetails;
  onSelect: (ref: SelectionRef) => void;
}

export function TitleRecommendations({
  details,
  onSelect,
}: TitleRecommendationsProps) {
  const hasRecommendations = details.recommendations.length > 0;
  const similar = useSimilarTitles(
    details.mediaType,
    details.id,
    !hasRecommendations,
  );
  const titles = (
    hasRecommendations ? details.recommendations : (similar.data ?? [])
  ).slice(0, MAX_TITLES);

  if (!hasRecommendations && similar.isLoading) {
    return <RecommendationsSkeleton />;
  }
  if (titles.length === 0) return null;

  return (
    <section className="flex flex-col gap-2.5">
      <div>
        <h3 className="eyebrow">You might also like</h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          Based on <span className="italic text-foreground/70">{details.title}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-3">
        {titles.map((title) => (
          <RecommendationCard
            key={`${title.mediaType}-${title.id}`}
            title={title}
            onSelect={() => onSelect(toSelectionRef(title))}
          />
        ))}
      </div>
    </section>
  );
}

function RecommendationCard({
  title,
  onSelect,
}: {
  title: SearchResult;
  onSelect: () => void;
}) {
  const image =
    backdropUrl(title.backdropPath, "w780") ??
    posterUrl(title.posterPath, "w342");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Open ${title.title}${title.year ? ` (${title.year})` : ""}`}
      className="group min-w-0 text-left"
    >
      <span className="relative block aspect-video overflow-hidden border border-border bg-secondary transition-colors group-hover:border-primary/60">
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="grid h-full place-items-center bg-gradient-to-br from-secondary to-background">
            <Clapperboard className="size-6 text-muted-foreground" />
          </span>
        )}
        <span className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/65 to-transparent" />
        <AdultBadge
          adult={title.adult}
          className="absolute bottom-2 left-2"
        />
        <RatingBadge
          average={title.voteAverage}
          votes={title.voteCount}
          variant="chip"
          className="absolute right-2 top-2"
        />
      </span>

      <span className="mt-1.5 flex min-w-0 items-start gap-2">
        <span className="line-clamp-2 min-w-0 flex-1 text-sm font-medium leading-snug transition-colors group-hover:text-primary">
          {title.title}
        </span>
        {title.year && (
          <span className="shrink-0 pt-0.5 text-[11px] text-muted-foreground">
            {title.year}
          </span>
        )}
      </span>
    </button>
  );
}

function RecommendationsSkeleton() {
  return (
    <section className="flex flex-col gap-2.5" aria-label="Loading recommendations">
      <Skeleton className="h-3 w-36" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: MAX_TITLES }).map((_, index) => (
          <Skeleton key={index} className="aspect-video w-full" />
        ))}
      </div>
    </section>
  );
}
