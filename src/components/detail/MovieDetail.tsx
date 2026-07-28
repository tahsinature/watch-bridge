import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clapperboard,
  Copy,
  Tv,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { IconAction } from "@/components/ui/icon-action";
import { RatingBadge } from "@/components/ui/rating-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TitleFacts } from "./TitleFacts";
import { ActionBar } from "@/components/actions/ActionBar";
import { LabeledBlock } from "./LabeledRow";
import { PosterActions } from "./PosterActions";
import { DetailActionBar } from "./DetailActionBar";
import { CastStrip } from "./CastStrip";
import { TrailerGallery } from "./TrailerGallery";
import { TitleRecommendations } from "./TitleRecommendations";
import { WhereToWatch } from "./WhereToWatch";
import { useDetails } from "@/hooks/useTmdb";
import { useCopiedFlag } from "@/hooks/useCopiedFlag";
import { useSyncLibraryMetadata } from "@/stores/library";
import { toast } from "@/stores/toast";
import { backdropUrl, posterUrl } from "@/lib/tmdb";
import type { SelectionRef, TitleDetails } from "@/types";

interface MovieDetailProps {
  selected: SelectionRef | null;
  onClose: () => void;
  onSelectTitle: (ref: SelectionRef) => void;
  onSelectPerson: (personId: number) => void;
}

export function MovieDetail({
  selected,
  onClose,
  onSelectTitle,
  onSelectPerson,
}: MovieDetailProps) {
  const { data, isLoading, error } = useDetails(
    selected?.mediaType,
    selected?.id,
    !!selected,
  );

  return (
    <Dialog open={!!selected} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        variant="fullscreen"
        className="grid-rows-[1fr_auto] gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">
          {data?.title ?? selected?.title ?? "Title details"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Details, trailers and actions for {selected?.title ?? "the selected title"}.
        </DialogDescription>

        {/* min-h-0 lets this row shrink inside the grid so it can scroll. */}
        <div
          key={
            selected
              ? `${selected.mediaType}-${selected.id}`
              : "closed-title"
          }
          className="min-h-0 overflow-y-auto scrollbar-thin"
        >
          {isLoading && <DetailSkeleton />}
          {error && (
            <EmptyState
              icon={AlertCircle}
              tone="error"
              title="Couldn't load details"
              detail={(error as Error).message}
            />
          )}
          {data && (
            <DetailBody
              details={data}
              onBack={onClose}
              onSelectTitle={onSelectTitle}
              onSelectPerson={onSelectPerson}
            />
          )}
        </div>

        {data && <DetailActionBar details={data} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function DetailBody({
  details,
  onBack,
  onSelectTitle,
  onSelectPerson,
}: {
  details: TitleDetails;
  onBack: () => void;
  onSelectTitle: (ref: SelectionRef) => void;
  onSelectPerson: (personId: number) => void;
}) {
  const backdrop = backdropUrl(details.backdropPath, "w1280");
  const heroPoster = posterUrl(details.posterPath, "w342");

  const [titleCopied, flagTitleCopied] = useCopiedFlag();

  // Opening a saved title is the natural moment to refresh its stored metadata.
  useSyncLibraryMetadata(details);

  const copyTitle = async () => {
    const year = details.year ? ` (${details.year})` : "";
    await navigator.clipboard.writeText(`${details.title}${year}`);
    flagTitleCopied();
    toast("Title copied", "success");
  };

  return (
    <div className="pb-6">
      {/* Hero — backdrop runs full bleed, everything else stays in a column. */}
      <div className="relative">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-4 top-4 z-10 inline-flex h-8 items-center gap-1.5 border border-white/20 bg-black/65 px-2.5 text-xs text-white/85 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-black/80 hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </button>

        <div className="h-40 w-full overflow-hidden sm:h-52 lg:h-64">
          {backdrop ? (
            <img src={backdrop} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/30 to-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-black/20" />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent" />
        </div>

        <div className="relative mx-auto -mt-16 flex max-w-3xl items-end gap-4 px-6">
          <div className="flex shrink-0 flex-col gap-1.5">
            <div className="h-40 w-28 overflow-hidden bg-secondary shadow-2xl ring-1 ring-border sm:h-48 sm:w-32">
              {heroPoster ? (
                <img
                  src={heroPoster}
                  alt={details.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <Clapperboard className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <PosterActions
              posterPath={details.posterPath}
              title={details.title}
              year={details.year}
            />
          </div>

          <div className="min-w-0 pb-1">
            <div className="mb-1.5 flex items-center gap-2">
              <Badge variant="primary" className="uppercase">
                {details.mediaType === "tv" ? (
                  <Tv className="h-3 w-3" />
                ) : (
                  <Clapperboard className="h-3 w-3" />
                )}
                {details.mediaType === "tv" ? "Series" : "Film"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <div className="flex min-w-0 items-start gap-1">
                <h2 className="min-w-0 text-balance text-xl font-bold leading-tight sm:text-2xl">
                  {details.title}
                </h2>
                <IconAction label="Copy title and year" onClick={copyTitle}>
                  {titleCopied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </IconAction>
              </div>
              <RatingBadge
                average={details.voteAverage}
                votes={details.voteCount}
                variant="detail"
                className="shrink-0"
              />
            </div>
            {details.originalTitle && details.originalTitle !== details.title && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {details.originalTitle}
              </p>
            )}
            {details.tagline && (
              <p className="mt-1 line-clamp-2 text-sm italic text-muted-foreground">
                “{details.tagline}”
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto flex max-w-3xl flex-col gap-7 px-6 pt-5">
        {details.cast.length > 0 && (
          <Section title="Cast">
            <CastStrip cast={details.cast} onSelectPerson={onSelectPerson} />
          </Section>
        )}

        <Section title="Details">
          <TitleFacts details={details} />
        </Section>

        <Section title="Actions">
          <LabeledBlock>
            <ActionBar details={details} />
          </LabeledBlock>
        </Section>

        <WhereToWatch details={details} />

        <Section title="Trailers">
          <TrailerGallery trailers={details.trailers} />
        </Section>

        <TitleRecommendations
          details={details}
          onSelect={onSelectTitle}
        />
      </div>

    </div>
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  /** Optional control rendered opposite the section label. */
  action?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="eyebrow">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="pb-6">
      <Skeleton className="h-40 w-full rounded-none sm:h-52" />
      <div className="relative -mt-16 flex items-end gap-4 px-6">
        <Skeleton className="h-40 w-28 rounded-xl sm:h-48 sm:w-32" />
        <div className="space-y-2 pb-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-4 px-6 pt-5">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="aspect-video w-full rounded-xl" />
      </div>
    </div>
  );
}
