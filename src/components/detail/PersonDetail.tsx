import { AlertCircle, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ProfileImage } from "@/components/ui/profile-image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DetailActionBar } from "./DetailActionBar";
import { MovieCard } from "@/components/search/MovieCard";
import { usePerson } from "@/hooks/useTmdb";
import { toSelectionRef } from "@/lib/library";
import type {
  PersonCreditMode,
  PersonDetails,
  PersonSelection,
  SearchResult,
  SelectionRef,
} from "@/types";

interface PersonDetailProps {
  person: PersonSelection | null;
  onClose: () => void;
  onSelectTitle: (ref: SelectionRef) => void;
  onOpenCommandPalette: () => void;
}

/** Acting, creative, and production filmography for a selected person. */
export function PersonDetail({
  person,
  onClose,
  onSelectTitle,
  onOpenCommandPalette,
}: PersonDetailProps) {
  const { data, isLoading, error } = usePerson(
    person?.id,
    person !== null,
  );

  return (
    <Dialog
      open={person !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent
        variant="fullscreen"
        className="grid-rows-[1fr_auto] gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">{data?.name ?? "Person"}</DialogTitle>
        <DialogDescription className="sr-only">
          Acting, creative, and production credits for{" "}
          {data?.name ?? "the selected person"}.
        </DialogDescription>

        <div className="min-h-0 overflow-y-auto scrollbar-thin">
          {isLoading && <PersonSkeleton />}
          {error && (
            <EmptyState
              icon={AlertCircle}
              tone="error"
              title="Couldn't load this person"
              detail={(error as Error).message}
            />
          )}
          {data && person && (
            <PersonBody
              key={`${data.id}-${person.creditMode}`}
              person={data}
              initialCreditMode={person.creditMode}
              onSelectTitle={onSelectTitle}
            />
          )}
        </div>

        <DetailActionBar
          onClose={onClose}
          onOpenCommandPalette={onOpenCommandPalette}
        />
      </DialogContent>
    </Dialog>
  );
}

function PersonBody({
  person,
  initialCreditMode,
  onSelectTitle,
}: {
  person: PersonDetails;
  initialCreditMode: PersonCreditMode;
  onSelectTitle: (ref: SelectionRef) => void;
}) {
  const creditGroups = getCreditGroups(person);
  const defaultCreditMode =
    creditGroups.find((group) => group.value === initialCreditMode)?.value ??
    creditGroups[0]?.value ??
    "acting";
  const creditSummary = creditGroups
    .map((group) => `${group.credits.length} ${group.summaryLabel}`)
    .join(" · ");

  return (
    <div className="pb-6">
      <div className="mx-auto flex max-w-6xl items-start gap-4 px-6 pt-6">
        <div className="size-24 shrink-0 overflow-hidden border border-border bg-secondary">
          <ProfileImage path={person.profilePath} alt={person.name} />
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-bold leading-tight sm:text-2xl">
            {person.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {[person.knownForDepartment, creditSummary]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {person.biography && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/70">
              {person.biography}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-7">
        {creditGroups.length === 0 ? (
          <EmptyState
            icon={User}
            title="No credits found"
            detail="TMDB has no acting, directing, creator, or producer credits listed for this person."
          />
        ) : (
          <Tabs defaultValue={defaultCreditMode}>
            {creditGroups.length > 1 ? (
              <TabsList
                aria-label="Filmography credit type"
                className="h-auto max-w-full flex-wrap justify-start"
              >
                {creditGroups.map((group) => (
                  <TabsTrigger key={group.value} value={group.value}>
                    {group.title} · {group.credits.length}
                  </TabsTrigger>
                ))}
              </TabsList>
            ) : null}

            {creditGroups.map((group) => (
              <TabsContent
                key={group.value}
                value={group.value}
                className="mt-4"
              >
                <FilmographyGrid
                  title={group.title}
                  credits={group.credits}
                  onSelectTitle={onSelectTitle}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}

interface CreditGroup {
  value: PersonCreditMode;
  title: string;
  summaryLabel: string;
  credits: SearchResult[];
}

function getCreditGroups(person: PersonDetails): CreditGroup[] {
  const groups: CreditGroup[] = [
    {
      value: "acting",
      title: "Acting",
      summaryLabel: "acting",
      credits: person.actingCredits,
    },
    {
      value: "creative",
      title: "Directed / created",
      summaryLabel: "directed / created",
      credits: person.creativeCredits,
    },
    {
      value: "production",
      title: "Produced",
      summaryLabel: "produced",
      credits: person.productionCredits,
    },
  ];

  return groups.filter((group) => group.credits.length > 0);
}

function FilmographyGrid({
  title,
  credits,
  onSelectTitle,
}: {
  title: string;
  credits: SearchResult[];
  onSelectTitle: (ref: SelectionRef) => void;
}) {
  if (credits.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="eyebrow">{title}</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {credits.map((credit) => (
          <MovieCard
            key={`${credit.mediaType}-${credit.id}`}
            result={credit}
            onSelect={(result) => onSelectTitle(toSelectionRef(result))}
          />
        ))}
      </div>
    </div>
  );
}

function PersonSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-6">
      <div className="flex items-start gap-4">
        <Skeleton className="size-24 shrink-0" />
        <div className="space-y-2 pt-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full" />
        ))}
      </div>
    </div>
  );
}
