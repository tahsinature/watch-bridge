import { PosterImage } from "@/components/ui/poster-image";
import { RatingBadge } from "@/components/ui/rating-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePeople } from "@/hooks/useTmdb";
import { itemKey, toSelectionRef } from "@/lib/library";
import type {
  PersonDetails,
  PersonCredit,
  SearchResult,
  SelectionRef,
} from "@/types";

const PREVIEW_LIMIT = 5;

interface CreativeCreditPreviewProps {
  people: PersonCredit[];
  onSelectTitle: (ref: SelectionRef) => void;
}

/** Combined, cached preview of every listed director or creator's top titles. */
export function CreativeCreditPreview({
  people,
  onSelectTitle,
}: CreativeCreditPreviewProps) {
  const peopleQueries = usePeople(
    people.map((person) => person.id),
    people.length > 0,
  );
  const names = people.map((person) => person.name).join(", ");
  const isLoading = peopleQueries.some((query) => query.isLoading);

  if (isLoading) {
    return (
      <div
        className="flex shrink-0 items-center gap-1"
        aria-label={`Loading top titles by ${names}`}
      >
        {Array.from({ length: PREVIEW_LIMIT }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-6 rounded-none" />
        ))}
      </div>
    );
  }

  const credits = combinedTopCredits(
    peopleQueries.map((query) => query.data),
  );
  if (credits.length === 0) return null;

  return (
    <div
      className="flex shrink-0 items-center gap-1"
      aria-label={`Top titles by ${names}`}
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

function combinedTopCredits(
  people: Array<PersonDetails | undefined>,
): SearchResult[] {
  const uniqueCredits = new Map<string, SearchResult>();

  for (const person of people) {
    for (const credit of person?.creativeCredits ?? []) {
      const key = itemKey(credit.id, credit.mediaType);
      if (!uniqueCredits.has(key)) uniqueCredits.set(key, credit);
    }
  }

  return [...uniqueCredits.values()]
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, PREVIEW_LIMIT);
}

function CreditPoster({
  credit,
  onSelect,
}: {
  credit: SearchResult;
  onSelect: () => void;
}) {
  return (
    <Tooltip disableHoverableContent>
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
