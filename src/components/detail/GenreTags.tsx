import {
  Atom,
  Clapperboard,
  Compass,
  Ghost,
  Heart,
  Landmark,
  Laugh,
  Music,
  Sparkles,
  Swords,
  Theater,
  Tv,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type GenreTone = "primary" | "gold" | "cyan" | "neutral";

interface GenreAppearance {
  icon: LucideIcon;
  tone: GenreTone;
}

const genreAppearances: Record<string, GenreAppearance> = {
  action: { icon: Zap, tone: "primary" },
  "action & adventure": { icon: Zap, tone: "primary" },
  adventure: { icon: Compass, tone: "gold" },
  animation: { icon: Sparkles, tone: "cyan" },
  comedy: { icon: Laugh, tone: "gold" },
  crime: { icon: Ghost, tone: "primary" },
  documentary: { icon: Clapperboard, tone: "cyan" },
  drama: { icon: Theater, tone: "primary" },
  family: { icon: Laugh, tone: "gold" },
  fantasy: { icon: Sparkles, tone: "cyan" },
  history: { icon: Landmark, tone: "gold" },
  horror: { icon: Ghost, tone: "primary" },
  kids: { icon: Laugh, tone: "gold" },
  music: { icon: Music, tone: "cyan" },
  mystery: { icon: Ghost, tone: "cyan" },
  news: { icon: Landmark, tone: "cyan" },
  reality: { icon: Tv, tone: "gold" },
  romance: { icon: Heart, tone: "primary" },
  "sci-fi & fantasy": { icon: Atom, tone: "cyan" },
  "science fiction": { icon: Atom, tone: "cyan" },
  soap: { icon: Theater, tone: "gold" },
  talk: { icon: Tv, tone: "cyan" },
  thriller: { icon: Zap, tone: "primary" },
  "tv movie": { icon: Tv, tone: "cyan" },
  war: { icon: Swords, tone: "primary" },
  "war & politics": { icon: Swords, tone: "primary" },
  western: { icon: Compass, tone: "gold" },
};

const toneClasses: Record<GenreTone, { tag: string; icon: string }> = {
  primary: {
    tag: "border-primary/35 bg-primary/[0.04]",
    icon: "border-primary/30 bg-primary/10 text-primary",
  },
  gold: {
    tag: "border-gold/35 bg-gold/[0.04]",
    icon: "border-gold/30 bg-gold/10 text-gold",
  },
  cyan: {
    tag: "border-cyan/35 bg-cyan/[0.04]",
    icon: "border-cyan/30 bg-cyan/10 text-cyan",
  },
  neutral: {
    tag: "border-border bg-secondary/30",
    icon: "border-border bg-secondary text-muted-foreground",
  },
};

export function GenreTags({ genres }: { genres: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Genres">
      {genres.map((genre) => {
        const appearance = genreAppearances[genre.toLowerCase()] ?? {
          icon: Clapperboard,
          tone: "neutral" as const,
        };
        const Icon = appearance.icon;
        const colors = toneClasses[appearance.tone];

        return (
          <li
            key={genre}
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
              <Icon className="size-3.5" strokeWidth={1.8} />
            </span>
            <span className="flex items-center px-2.5 text-xs font-medium tracking-wide text-foreground/90">
              {genre}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
