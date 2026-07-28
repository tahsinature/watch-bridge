import { cva, type VariantProps } from "class-variance-authority";
import { Star } from "lucide-react";
import { AudienceSignal } from "@/components/ui/audience-signal";
import { formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";

const ratingBadgeVariants = cva(
  "inline-flex items-center gap-1 font-semibold text-gold",
  {
    variants: {
      variant: {
        /** Inline on a card or panel surface. */
        plain: "text-xs [&_svg]:size-3.5",
        /** Larger, for the detail panel's facts list. */
        detail: "text-sm [&_svg]:size-4",
        /** Over poster artwork that has a gradient behind it. */
        overlay: "text-[11px] [&_svg]:size-3",
        /** Over bare artwork, so it brings its own backing. */
        chip: "border border-white/15 bg-black/70 px-1.5 py-0.5 text-[11px] [&_svg]:size-3",
      },
    },
    defaultVariants: { variant: "plain" },
  },
);

interface RatingBadgeProps extends VariantProps<typeof ratingBadgeVariants> {
  average: number;
  votes: number;
  className?: string;
}

/**
 * TMDB rating together with its vote count — they belong in one component
 * because they belong on screen together. An average says nothing on its own
 * until you know whether four people or forty thousand supplied it.
 *
 * Renders nothing for an unrated title.
 */
export function RatingBadge({
  average,
  votes,
  variant,
  className,
}: RatingBadgeProps) {
  const rating = formatRating(average);
  if (!rating) return null;

  // Muted grey vanishes against poster art, so those variants use white.
  const onArtwork = variant === "overlay" || variant === "chip";

  return (
    <span
      className={cn(ratingBadgeVariants({ variant }), className)}
    >
      <Star className="fill-gold text-gold" />
      {rating}
      {votes > 0 && (
        <AudienceSignal
          votes={votes}
          onArtwork={onArtwork}
          showLabel={variant === "detail"}
        />
      )}
    </span>
  );
}
