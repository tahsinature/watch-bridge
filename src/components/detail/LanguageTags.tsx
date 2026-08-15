import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

const languageTones = [
  {
    tag: "border-cyan/35 bg-cyan/[0.04]",
    icon: "border-cyan/30 bg-cyan/10 text-cyan",
  },
  {
    tag: "border-gold/35 bg-gold/[0.04]",
    icon: "border-gold/30 bg-gold/10 text-gold",
  },
] as const;

export function LanguageTags({ languages }: { languages: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Spoken languages">
      {languages.map((language, index) => {
        const colors = languageTones[index % languageTones.length];

        return (
          <li
            key={`${language}-${index}`}
            className={cn(
              "inline-flex min-h-8 items-stretch overflow-hidden border",
              colors.tag,
            )}
          >
            <span
              className={cn(
                "grid w-8 shrink-0 place-items-center border-r",
                colors.icon,
              )}
              aria-hidden="true"
            >
              <Languages className="size-3.5" strokeWidth={1.8} />
            </span>
            <span className="flex items-center px-2.5 text-xs font-medium tracking-wide text-foreground/90">
              {language}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
