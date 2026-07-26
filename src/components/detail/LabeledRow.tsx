import { cn } from "@/lib/utils";

interface LabeledRowProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * One row of a labeled block: a fixed micro-label column and its content.
 * Stacks on narrow screens so long values keep their width.
 */
export function LabeledRow({ label, children, className }: LabeledRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-1 border-b border-border/60 py-2.5 last:border-0 sm:grid-cols-[6.5rem_1fr] sm:gap-3",
        className,
      )}
    >
      <span className="pt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Bordered container that groups LabeledRows under a section. */
export function LabeledBlock({ children }: { children: React.ReactNode }) {
  return <div className="border border-border px-3">{children}</div>;
}
