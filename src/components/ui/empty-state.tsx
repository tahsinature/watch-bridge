import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  detail?: string;
  /** Red treatment for failures, as opposed to a merely empty list. */
  tone?: "default" | "error";
  /** Anything that belongs below the message — recents, calls to action. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * The centred icon / headline / explanation block used whenever a surface has
 * nothing to show. Shared so the five places that need one can't drift apart
 * again, which is exactly what had happened.
 */
export function EmptyState({
  icon: Icon,
  title,
  detail,
  tone = "default",
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 py-20 text-center",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <span
          className={cn(
            "grid size-14 place-items-center border",
            tone === "error"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-primary/30 bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-7" />
        </span>
        <div>
          <p className="text-lg font-semibold">{title}</p>
          {detail && (
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {detail}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
