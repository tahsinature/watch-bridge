import { useState } from "react";
import { Play, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Trailer } from "@/types";

interface TrailerGalleryProps {
  trailers: Trailer[];
}

export function TrailerGallery({ trailers }: TrailerGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (trailers.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        <Youtube className="h-4 w-4" />
        No trailers available for this title.
      </div>
    );
  }

  const active = trailers[Math.min(activeIndex, trailers.length - 1)];

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-border">
        <iframe
          key={active.key}
          src={`https://www.youtube-nocookie.com/embed/${active.key}?rel=0`}
          title={active.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>

      {trailers.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {trailers.map((trailer, index) => (
            <button
              key={trailer.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "group relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg ring-1 ring-border transition-all",
                index === activeIndex
                  ? "ring-2 ring-primary"
                  : "opacity-70 hover:opacity-100",
              )}
              title={trailer.name}
            >
              <img
                src={`https://img.youtube.com/vi/${trailer.key}/mqdefault.jpg`}
                alt={trailer.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <Play className="h-5 w-5 fill-white text-white" />
              </span>
              <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[9px] font-medium uppercase text-white">
                {trailer.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
