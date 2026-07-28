import { AlertCircle, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
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
import { posterUrl } from "@/lib/tmdb";
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
}

/** Acting and creative filmography, opened from a title's people credits. */
export function PersonDetail({
  person,
  onClose,
  onSelectTitle,
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
          Acting and creative credits for {data?.name ?? "the selected person"}.
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

        <DetailActionBar onClose={onClose} />
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
  const photo = posterUrl(person.profilePath, "w185");
  const defaultCreditMode =
    initialCreditMode === "creative" && person.creativeCredits.length > 0
      ? "creative"
      : person.actingCredits.length > 0
        ? "acting"
        : "creative";
  const hasBothCreditTypes =
    person.actingCredits.length > 0 && person.creativeCredits.length > 0;
  const creditSummary = [
    person.actingCredits.length > 0
      ? `${person.actingCredits.length} acting`
      : "",
    person.creativeCredits.length > 0
      ? `${person.creativeCredits.length} directed / created`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="pb-6">
      <div className="mx-auto flex max-w-6xl items-start gap-4 px-6 pt-6">
        <div className="size-24 shrink-0 overflow-hidden border border-border bg-secondary">
          {photo ? (
            <img
              src={photo}
              alt={person.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <User className="size-8 text-muted-foreground" />
            </div>
          )}
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
        {person.actingCredits.length === 0 &&
        person.creativeCredits.length === 0 ? (
          <EmptyState
            icon={User}
            title="No credits found"
            detail="TMDB has no acting, directing or creator credits listed for this person."
          />
        ) : (
          <Tabs defaultValue={defaultCreditMode}>
            {hasBothCreditTypes && (
              <TabsList aria-label="Filmography credit type">
                <TabsTrigger value="acting">
                  Acting · {person.actingCredits.length}
                </TabsTrigger>
                <TabsTrigger value="creative">
                  Directed / created · {person.creativeCredits.length}
                </TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="acting" className="mt-4">
              <FilmographyGrid
                title="Acting"
                credits={person.actingCredits}
                onSelectTitle={onSelectTitle}
              />
            </TabsContent>
            <TabsContent value="creative" className="mt-4">
              <FilmographyGrid
                title="Directed / created"
                credits={person.creativeCredits}
                onSelectTitle={onSelectTitle}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
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
