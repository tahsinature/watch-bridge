import { User } from "lucide-react";
import { posterUrl } from "@/lib/tmdb";
import type { CastMember, PersonSelection } from "@/types";

interface CastStripProps {
  cast: CastMember[];
  onSelectPerson: (person: PersonSelection) => void;
}

export function CastStrip({ cast, onSelectPerson }: CastStripProps) {
  if (cast.length === 0) return null;

  return (
    <div className="flex w-full min-w-0 max-w-full gap-3 overflow-x-auto pb-2 scrollbar-thin">
      {cast.map((member, index) => {
        const photo = posterUrl(member.profilePath, "w185");
        return (
          <button
            key={`${member.id}-${index}`}
            onClick={() =>
              onSelectPerson({ id: member.id, creditMode: "acting" })
            }
            title={`See what ${member.name} is in`}
            className="group/cast flex w-20 shrink-0 flex-col items-center text-center"
          >
            <div className="size-20 overflow-hidden border border-border bg-secondary grayscale transition-all group-hover/cast:border-primary/60 group-hover/cast:grayscale-0">
              {photo ? (
                <img
                  src={photo}
                  alt={member.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <User className="h-7 w-7 text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-tight">
              {member.name}
            </p>
            {member.character && (
              <p className="line-clamp-1 text-[11px] text-muted-foreground">
                {member.character}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
