import { User } from "lucide-react";
import { posterUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface ProfileImageProps {
  path: string | null;
  alt: string;
  className?: string;
}

export function ProfileImage({ path, alt, className }: ProfileImageProps) {
  const url = posterUrl(path, "w185");

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
        "grid h-full w-full place-items-center bg-secondary text-muted-foreground",
        className,
      )}
      role={alt ? "img" : undefined}
      aria-label={alt ? `${alt} has no profile photo` : undefined}
      aria-hidden={alt ? undefined : "true"}
    >
      <User className="size-6" aria-hidden="true" />
    </div>
  );
}
