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
    <TableRow className="group h-[5.25rem] bg-background/20">
      <TableCell className="sticky left-0 z-20 border-r border-border bg-popover p-0 group-hover:bg-secondary">
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full min-w-64 items-center gap-3 px-4 py-2 text-left"
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
        <TableCell className="px-4">
          <RatingCell average={voteAverage} />
        </TableCell>
      ) : null}

      {fields.includes("votes") ? (
        <TableCell className="px-4">
          {voteCount > 0 ? (
            <AudienceSignal
              votes={voteCount}
              onArtwork={false}
              showLabel={false}
            />
          ) : (
            <EmptyValue />
          )}
        </TableCell>
      ) : null}

      {fields.includes("runtime") ? (
        <TableCell className="px-4 text-xs">
          {isLoading && !length ? (
            <Skeleton className="h-4 w-12 rounded-none" />
          ) : (
            length ?? <EmptyValue />
          )}
        </TableCell>
      ) : null}

      {fields.includes("ageRating") ? (
        <TableCell className="px-4">
          <AgeRatingCell
            details={data}
            region={region}
            adult={data?.adult ?? item.adult}
            loading={isLoading}
          />
        </TableCell>
      ) : null}

      {fields.includes("genres") ? (
        <TableCell className="max-w-56 whitespace-normal px-4">
          {genres.length > 0 ? (
            <div className="flex flex-wrap gap-1">
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
        </TableCell>
      ) : null}

      {fields.includes("watchProviders") ? (
        <TableCell className="px-4">
          <CompareWatchProviders
            region={region}
            providers={region ? data?.watchProviders[region] : undefined}
            loading={isLoading}
            failed={isError}
          />
        </TableCell>
      ) : null}

      {fields.includes("userRating") ? (
        <TableCell className="px-4">
          {item.userRating != null ? (
            <StarRating value={item.userRating} size="sm" />
          ) : (
            <EmptyValue />
          )}
        </TableCell>
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
