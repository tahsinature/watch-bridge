import { useState } from "react";
import { Clapperboard, Flame, Tv } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MinimumVotesSelect } from "./MinimumVotesSelect";
import { MovieGrid } from "./MovieGrid";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGenres,
  useGenreTitles,
  useTrendingTitles,
} from "@/hooks/useTmdb";
import { cn } from "@/lib/utils";
import {
  filterByMinimumVotes,
  minimumVotesLabel,
} from "@/lib/voteFilter";
import { useSettings } from "@/stores/settings";
import type { Genre, MediaType, SearchResult } from "@/types";

type ExploreMode = "trending" | MediaType;

const EXPLORE_MODES = [
  { value: "trending", label: "Trending", icon: Flame },
  { value: "movie", label: "Films", icon: Clapperboard },
  { value: "tv", label: "Series", icon: Tv },
] satisfies {
  value: ExploreMode;
  label: string;
  icon: LucideIcon;
}[];

const MEDIA_LABELS: Record<MediaType, string> = {
  movie: "films",
  tv: "series",
};

export function ExploreHome({
  onSelect,
}: {
  onSelect: (result: SearchResult) => void;
}) {
  const [mode, setMode] = useState<ExploreMode>("trending");
  const [genreByType, setGenreByType] = useState<
    Record<MediaType, number | undefined>
  >({
    movie: undefined,
    tv: undefined,
  });
  const minimumVotes = useSettings((state) => state.minimumVotes);

  const mediaType = mode === "trending" ? undefined : mode;
  const trending = useTrendingTitles(mode === "trending");
  const genres = useGenres(mediaType, mediaType !== undefined);
  const selectedGenreId =
    mediaType === undefined
      ? undefined
      : (genreByType[mediaType] ?? genres.data?.[0]?.id);
  const discovery = useGenreTitles(
    mediaType,
    selectedGenreId,
    mediaType !== undefined,
  );

  const selectedGenre = genres.data?.find(
    (genre) => genre.id === selectedGenreId,
  );
  const activeQuery = mode === "trending" ? trending : discovery;
  const results =
    mode === "trending"
      ? filterByMinimumVotes(trending.data ?? [], minimumVotes)
      : (discovery.data ?? []);
  const filteredEverything =
    minimumVotes > 0 &&
    mode === "trending" &&
    (trending.data?.length ?? 0) > 0 &&
    results.length === 0;
  const minimumFilterEmpty =
    minimumVotes > 0 &&
    results.length === 0 &&
    (mode === "trending"
      ? (trending.data?.length ?? 0) > 0
      : discovery.data !== undefined);
  const error =
    mode === "trending"
      ? trending.error
      : (genres.error ?? discovery.error);
  const emptyTitle =
    filteredEverything
      ? `No trending titles with ${minimumVotesLabel(minimumVotes)} votes`
      : mode === "trending"
        ? "Nothing is trending right now"
        : selectedGenre
          ? minimumVotes > 0
            ? `No ${selectedGenre.name} ${MEDIA_LABELS[mode]} with ${minimumVotesLabel(minimumVotes)} votes`
            : `No ${selectedGenre.name} ${MEDIA_LABELS[mode]} found`
          : `No ${MEDIA_LABELS[mode]} found`;

  const selectGenre = (genre: Genre) => {
    if (!mediaType) return;
    setGenreByType((current) => ({
      ...current,
      [mediaType]: genre.id,
    }));
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="eyebrow">Explore</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "trending"
              ? "Global films and series trending on TMDB this week"
              : `Popular ${MEDIA_LABELS[mode]} by genre`}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <MinimumVotesSelect />
          <div
            role="group"
            aria-label="Explore mode"
            className="inline-flex h-9 items-center gap-1 border border-border bg-secondary/40 p-1"
          >
            {EXPLORE_MODES.map((option) => {
              const Icon = option.icon;
              const selected = option.value === mode;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setMode(option.value)}
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors [&_svg]:size-4",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {mediaType !== undefined &&
        (genres.isLoading ? (
          <GenreSkeleton />
        ) : (
          <div
            className="flex flex-wrap gap-2"
            aria-label={`${MEDIA_LABELS[mediaType]} genres`}
          >
            {(genres.data ?? []).map((genre) => {
              const selected = genre.id === selectedGenreId;
              return (
                <button
                  key={genre.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectGenre(genre)}
                  className={cn(
                    "border px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        ))}

      <MovieGrid
        results={results}
        loading={
          activeQuery.isLoading ||
          (mediaType !== undefined && genres.isLoading)
        }
        error={(error as Error) ?? null}
        query={selectedGenre?.name ?? "trending"}
        emptyTitle={emptyTitle}
        emptyDetail={
          minimumFilterEmpty
            ? mode === "trending"
              ? "Lower the minimum vote count to include newer titles."
              : "Lower the minimum vote count or try another genre."
            : "Try another genre or come back later."
        }
        onSelect={onSelect}
      />
    </section>
  );
}

function GenreSkeleton() {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Loading genres">
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className="h-7 w-20" />
      ))}
    </div>
  );
}
