import { FileQuestion, House } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAppBasePath } from "@/lib/appPath";

export function NotFoundPage() {
  const requestedPath = window.location.pathname;

  return (
    <main className="container grid min-h-screen place-items-center py-10">
      <section className="w-full max-w-xl border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-2.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="inline-flex items-center gap-2 text-primary">
            <span className="size-1.5 bg-primary" aria-hidden="true" />
            Navigation error
          </span>
          <span>HTTP · 404</span>
        </div>

        <div className="relative overflow-hidden">
          <span
            className="pointer-events-none absolute -right-3 -top-8 select-none text-[9rem] font-black leading-none text-foreground/[0.025]"
            aria-hidden="true"
          >
            404
          </span>

          <EmptyState
            icon={FileQuestion}
            tone="error"
            title="Page not found"
            detail="That route doesn't exist in WatchBridge. Check the address or head back to the search screen."
            className="relative px-6"
          >
            <div className="flex max-w-full flex-col items-center gap-5">
              <code className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                {requestedPath}
              </code>
              <Button onClick={() => window.location.replace(getAppBasePath())}>
                <House />
                Return to WatchBridge
              </Button>
            </div>
          </EmptyState>
        </div>
      </section>
    </main>
  );
}
