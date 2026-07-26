import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClass = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

/** 1–5 star rating. Interactive when `onChange` is provided, else read-only. */
export function StarRating({ value, onChange, size = "md", className }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;
  const shown = hover || value || 0;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= shown;
        const StarButton = interactive ? "button" : "span";
        return (
          <StarButton
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange(star) : undefined}
            onMouseEnter={interactive ? () => setHover(star) : undefined}
            onMouseLeave={interactive ? () => setHover(0) : undefined}
            className={cn(interactive && "cursor-pointer transition-transform hover:scale-110")}
            aria-label={interactive ? `Rate ${star} of 5` : undefined}
          >
            <Star
              className={cn(
                sizeClass[size],
                filled ? "fill-gold text-gold" : "fill-transparent text-muted-foreground/40",
              )}
            />
          </StarButton>
        );
      })}
    </div>
  );
}
