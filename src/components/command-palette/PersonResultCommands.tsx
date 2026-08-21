import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { ProfileImage } from "@/components/ui/profile-image";
import type { PersonSearchResult } from "@/types";

export function PersonResultCommands({
  people,
  searching,
  closestMatches,
  onSelect,
}: {
  people: PersonSearchResult[];
  searching: boolean;
  closestMatches: boolean;
  onSelect: (person: PersonSearchResult) => void;
}) {
  if (people.length === 0) return null;

  return (
    <>
      <CommandSeparator />
      <CommandGroup
        heading={
          searching
            ? "Searching people…"
            : closestMatches
              ? "Closest people"
              : "People"
        }
      >
        {people.map((person) => {
          const knownFor = person.knownFor
            .slice(0, 2)
            .map((title) => title.title)
            .join(" · ");

          return (
            <CommandItem
              key={person.id}
              value={`person ${person.name} ${person.knownForDepartment} ${knownFor}`}
              onSelect={() => onSelect(person)}
              className="py-2.5"
            >
              <div className="size-10 shrink-0 overflow-hidden border border-border bg-secondary">
                <ProfileImage path={person.profilePath} alt="" />
              </div>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-medium">{person.name}</span>
                <span className="truncate text-[11px] uppercase tracking-wider text-muted-foreground group-data-[selected=true]:text-primary-foreground/75">
                  {[person.knownForDepartment, knownFor]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
            </CommandItem>
          );
        })}
      </CommandGroup>
    </>
  );
}
