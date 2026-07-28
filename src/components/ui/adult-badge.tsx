import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdultBadgeProps {
  adult: boolean;
  className?: string;
}

/** Compact warning shown only for TMDB's adult-title classification. */
export function AdultBadge({ adult, className }: AdultBadgeProps) {
  if (!adult) return null;

  return (
    <span
      title="Marked as an adult title by TMDB"
      className={cn(
        "inline-flex items-center gap-1 border border-rose-400/50 bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-200",
        className,
      )}
    >
      <Flag className="h-3 w-3" aria-hidden="true" />
      Adult
    </span>
  );
}
