import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { AdultBadge } from "@/components/ui/adult-badge";
import { AudienceSignal } from "@/components/ui/audience-signal";
import { Badge } from "@/components/ui/badge";
import { PosterImage } from "@/components/ui/poster-image";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/ui/star-rating";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { CompareWatchProviders } from "./CompareWatchProviders";
import { useDetails } from "@/hooks/useTmdb";
import type { CompareField } from "@/lib/compareFields";
import { formatRating, formatRuntime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LibraryItem, TitleDetails } from "@/types";

interface CompareTableRowProps {
  item: LibraryItem;
  fields: CompareField[];
  region: string | undefined;
  onOpen: () => void;
}

export function CompareTableRow({
  item,
  fields,
  region,
  onOpen,
}: CompareTableRowProps) {
  const { data, isLoading, isError } = useDetails(
    item.mediaType,
    item.id,
    true,
  );
  const length =
    item.mediaType === "tv"
      ? formatSeriesLength(data?.numberOfSeasons, data?.numberOfEpisodes)
      : formatRuntime(data?.runtime ?? item.runtime);
  const voteAverage = data?.voteAverage ?? item.voteAverage;
  const voteCount = data?.voteCount ?? item.voteCount;
  const genres = data?.genres.length ? data.genres : item.genres;

  return (
    <TableRow className="group block h-auto overflow-hidden border border-border bg-background/20 sm:table-row sm:h-[5.25rem] sm:border-x-0 sm:border-t-0">
      <TableCell className="block border-b border-border bg-secondary/35 p-0 group-hover:bg-secondary sm:sticky sm:left-0 sm:z-20 sm:table-cell sm:border-b-0 sm:border-r sm:bg-popover">
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left sm:min-w-64 sm:py-2"
        >
          <span className="h-16 w-11 shrink-0 overflow-hidden border border-border bg-secondary">
            <PosterImage
              path={item.posterPath}
              alt={item.title}
              size="w185"
            />
          </span>
          <span className="min-w-0">
            <span
              className="block max-w-48 truncate text-sm font-semibold transition-colors group-hover:text-primary"
              title={item.title}
            >
              {item.title}
            </span>
            <span className="mt-1 block text-[11px] uppercase tracking-wide text-muted-foreground">
              {item.year} · {item.mediaType === "tv" ? "Series" : "Film"}
            </span>
          </span>
        </button>
      </TableCell>

      {fields.includes("rating") ? (
        <CompareValueCell label="Rating">
          <RatingCell average={voteAverage} />
        </CompareValueCell>
      ) : null}

      {fields.includes("votes") ? (
        <CompareValueCell label="Audience">
          {voteCount > 0 ? (
            <AudienceSignal
              votes={voteCount}
              onArtwork={false}
              showLabel={false}
            />
          ) : (
            <EmptyValue />
          )}
        </CompareValueCell>
      ) : null}

      {fields.includes("runtime") ? (
        <CompareValueCell label="Length" valueClassName="text-xs">
          {isLoading && !length ? (
            <Skeleton className="h-4 w-12 rounded-none" />
          ) : (
            length ?? <EmptyValue />
          )}
        </CompareValueCell>
      ) : null}

      {fields.includes("ageRating") ? (
        <CompareValueCell label="Age rating">
          <AgeRatingCell
            details={data}
            region={region}
            adult={data?.adult ?? item.adult}
            loading={isLoading}
          />
        </CompareValueCell>
      ) : null}

      {fields.includes("genres") ? (
        <CompareValueCell
          label="Genres"
          className="sm:max-w-56"
          valueClassName="whitespace-normal"
        >
          {genres.length > 0 ? (
            <div className="flex flex-wrap justify-end gap-1 sm:justify-start">
              {genres.slice(0, 3).map((genre) => (
                <Badge
                  key={genre}
                  variant="outline"
                  className="px-1.5 py-0 text-[10px]"
                >
                  {genre}
                </Badge>
              ))}
            </div>
          ) : (
            <EmptyValue />
          )}
        </CompareValueCell>
      ) : null}

      {fields.includes("watchProviders") ? (
        <CompareValueCell
          label={region ? `Watch · ${region}` : "Watch"}
          valueClassName="min-w-0"
        >
          <CompareWatchProviders
            region={region}
            providers={region ? data?.watchProviders[region] : undefined}
            loading={isLoading}
            failed={isError}
          />
        </CompareValueCell>
      ) : null}

      {fields.includes("userRating") ? (
        <CompareValueCell label="Your rating">
          {item.userRating != null ? (
            <StarRating value={item.userRating} size="sm" />
          ) : (
            <EmptyValue />
          )}
        </CompareValueCell>
      ) : null}
    </TableRow>
  );
}

function RatingCell({ average }: { average: number }) {
  const rating = formatRating(average);
  if (!rating) return <EmptyValue />;

  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
      <Star className="size-4 fill-gold" />
      {rating}
    </span>
  );
}

function AgeRatingCell({
  details,
  region,
  adult,
  loading,
}: {
  details: TitleDetails | undefined;
  region: string | undefined;
  adult: boolean;
  loading: boolean;
}) {
  if (adult) return <AdultBadge adult />;

  const certificationRegion = [region, "US"].find(
    (country) => country && details?.certifications[country],
  );
  const certification = certificationRegion
    ? details?.certifications[certificationRegion]
    : undefined;

  if (loading && !details) {
    return <Skeleton className="h-6 w-12 rounded-none" />;
  }

  if (!certification) return <EmptyValue />;

  return (
    <span className="inline-flex items-center gap-1.5 border border-border px-2 py-1 text-[11px]">
      {certification}
      <span className="text-muted-foreground">{certificationRegion}</span>
    </span>
  );
}

function EmptyValue() {
  return <span className="text-xs text-muted-foreground/60">—</span>;
}

function CompareValueCell({
  label,
  className,
  valueClassName,
  children,
}: {
  label: string;
  className?: string;
  valueClassName?: string;
  children: ReactNode;
}) {
  return (
    <TableCell
      className={cn(
        "grid min-h-11 grid-cols-[6rem_minmax(0,1fr)] items-center gap-3 border-b border-border/60 px-4 py-2 last:border-b-0 sm:table-cell sm:min-h-0 sm:border-b-0 sm:px-4",
        className,
      )}
    >
      <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground sm:hidden">
        {label}
      </span>
      <div
        className={cn(
          "min-w-0 justify-self-end sm:justify-self-auto",
          valueClassName,
        )}
      >
        {children}
      </div>
    </TableCell>
  );
}

function formatSeriesLength(
  seasons: number | null | undefined,
  episodes: number | null | undefined,
): string | null {
  const parts: string[] = [];

  if (seasons != null) {
    parts.push(`${seasons} ${seasons === 1 ? "season" : "seasons"}`);
  }
  if (episodes != null) {
    parts.push(`${episodes} ${episodes === 1 ? "episode" : "episodes"}`);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}
