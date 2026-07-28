import { PosterImage } from "@/components/ui/poster-image";
import { RatingBadge } from "@/components/ui/rating-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePerson } from "@/hooks/useTmdb";
import { toSelectionRef } from "@/lib/library";
import type {
  PersonCredit,
  SearchResult,
  SelectionRef,
} from "@/types";

const PREVIEW_LIMIT = 5;

interface CreativeCreditPreviewProps {
  person: PersonCredit;
  onSelectTitle: (ref: SelectionRef) => void;
}

/** Compact, cached preview of a director or creator's most-voted titles. */
export function CreativeCreditPreview({
  person,
  onSelectTitle,
}: CreativeCreditPreviewProps) {
  const { data, isLoading } = usePerson(person.id, true);

  if (isLoading) {
    return (
      <div
        className="flex shrink-0 items-center gap-1"
        aria-label={`Loading top titles by ${person.name}`}
      >
        {Array.from({ length: PREVIEW_LIMIT }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-6 rounded-none" />
        ))}
      </div>
    );
  }

  const credits = data?.creativeCredits.slice(0, PREVIEW_LIMIT) ?? [];
  if (credits.length === 0) return null;

  return (
    <div
      className="flex shrink-0 items-center gap-1"
      aria-label={`Top titles by ${person.name}`}
    >
      {credits.map((credit) => (
        <CreditPoster
          key={`${credit.mediaType}-${credit.id}`}
          credit={credit}
          onSelect={() => onSelectTitle(toSelectionRef(credit))}
        />
      ))}
    </div>
  );
}

function CreditPoster({
  credit,
  onSelect,
}: {
  credit: SearchResult;
  onSelect: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Open ${credit.title}`}
          className="group relative h-9 w-6 overflow-hidden border border-border bg-secondary transition-all hover:z-10 hover:scale-110 hover:border-primary focus-visible:z-10 focus-visible:scale-110 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PosterImage
            path={credit.posterPath}
            alt=""
            size="w185"
            className="transition-opacity group-hover:opacity-90"
          />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="w-56 border-foreground/20 bg-card p-3 shadow-2xl ring-1 ring-black/40"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="line-clamp-2 font-medium leading-snug">
              {credit.title}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {[credit.year, credit.mediaType === "tv" ? "Series" : "Film"]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <RatingBadge
            average={credit.voteAverage}
            votes={credit.voteCount}
            variant="plain"
            className="shrink-0"
          />
        </div>
        {credit.overview && (
          <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">
            {credit.overview}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
