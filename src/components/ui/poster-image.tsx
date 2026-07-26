import { Clapperboard } from "lucide-react";
import { posterUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface PosterImageProps {
  path: string | null;
  alt: string;
  size?: "w185" | "w342" | "w500";
  className?: string;
}

/** Poster with a graceful gradient fallback when no image is available. */
export function PosterImage({ path, alt, size = "w342", className }: PosterImageProps) {
  const url = posterUrl(path, size);
  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        loading="lazy"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-background",
        className,
      )}
    >
      <Clapperboard className="h-7 w-7 text-muted-foreground" />
    </div>
  );
}
