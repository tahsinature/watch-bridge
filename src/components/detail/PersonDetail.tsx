import { AlertCircle, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailActionBar } from "./DetailActionBar";
import { MovieCard } from "@/components/search/MovieCard";
import { usePerson } from "@/hooks/useTmdb";
import { posterUrl } from "@/lib/tmdb";
import { toSelectionRef } from "@/lib/library";
import type { PersonDetails, SelectionRef } from "@/types";

interface PersonDetailProps {
  personId: number | null;
  onClose: () => void;
  onSelectTitle: (ref: SelectionRef) => void;
}

/** A cast member's filmography, opened from the cast strip of any title. */
export function PersonDetail({
  personId,
  onClose,
  onSelectTitle,
}: PersonDetailProps) {
  const { data, isLoading, error } = usePerson(
    personId ?? undefined,
    personId !== null,
  );

  return (
    <Dialog
      open={personId !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent
        variant="fullscreen"
        className="grid-rows-[1fr_auto] gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">{data?.name ?? "Person"}</DialogTitle>
        <DialogDescription className="sr-only">
          Filmography for {data?.name ?? "the selected person"}.
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
          {data && <PersonBody person={data} onSelectTitle={onSelectTitle} />}
        </div>

        <DetailActionBar onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

function PersonBody({
  person,
  onSelectTitle,
}: {
  person: PersonDetails;
  onSelectTitle: (ref: SelectionRef) => void;
}) {
  const photo = posterUrl(person.profilePath, "w185");

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
            {[person.knownForDepartment, `${person.credits.length} titles`]
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
        {person.credits.length === 0 ? (
          <EmptyState
            icon={User}
            title="No credits found"
            detail="TMDB has no acting credits listed for this person."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            <h3 className="eyebrow">Known for</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {person.credits.map((credit) => (
                <MovieCard
                  key={`${credit.mediaType}-${credit.id}`}
                  result={credit}
                  onSelect={(result) => onSelectTitle(toSelectionRef(result))}
                />
              ))}
            </div>
          </div>
        )}
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
