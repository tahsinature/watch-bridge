import { Badge } from "@/components/ui/badge";
import { ProfileImage } from "@/components/ui/profile-image";
import type { PersonSearchResult } from "@/types";

const MAX_VISIBLE_PEOPLE = 6;

export function PeopleResults({
  people,
  onSelect,
}: {
  people: PersonSearchResult[];
  onSelect: (person: PersonSearchResult) => void;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="eyebrow">People</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {people.slice(0, MAX_VISIBLE_PEOPLE).map((person) => {
          const knownFor = person.knownFor
            .slice(0, 2)
            .map((title) => title.title)
            .join(" · ");

          return (
            <button
              key={person.id}
              type="button"
              onClick={() => onSelect(person)}
              title={`Open ${person.name}'s filmography`}
              className="group/person flex min-w-0 items-center gap-3 border border-border bg-background/60 p-2.5 text-left transition-colors hover:border-primary/50 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <div className="size-16 shrink-0 overflow-hidden border border-border bg-secondary">
                <ProfileImage
                  path={person.profilePath}
                  alt={person.name}
                  className="grayscale transition-[filter] group-hover/person:grayscale-0"
                />
              </div>
              <span className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
                <span className="w-full truncate text-sm font-semibold">
                  {person.name}
                </span>
                {person.knownForDepartment ? (
                  <Badge variant={departmentTone(person.knownForDepartment)}>
                    {person.knownForDepartment}
                  </Badge>
                ) : null}
                <span className="w-full truncate text-[11px] text-muted-foreground">
                  {knownFor || "View filmography"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function departmentTone(
  department: string,
): "primary" | "gold" | "cyan" | "outline" {
  if (department === "Acting") return "primary";
  if (department === "Production") return "gold";
  if (department === "Directing") return "cyan";
  return "outline";
}
