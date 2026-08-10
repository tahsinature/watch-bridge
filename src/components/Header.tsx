import { Clapperboard, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PrimaryNav } from "@/components/PrimaryNav";
import type { View } from "@/types";

interface HeaderProps {
  view: View;
  onViewChange: (view: View) => void;
  /** Brand click — back to a clean Search view. */
  onGoHome: () => void;
  shortlistCount: number;
  watchedCount: number;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
}

export function Header({
  view,
  onViewChange,
  onGoHome,
  shortlistCount,
  watchedCount,
  onOpenCommandPalette,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95">
      <div className="container flex h-16 items-center justify-between gap-4">
        <button
          onClick={onGoHome}
          aria-label="WatchBridge home"
          className="group flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="grid size-9 place-items-center border border-primary/30 bg-primary/10 text-primary transition-colors group-hover:border-primary/70 group-hover:bg-primary/20">
            <Clapperboard className="size-5" />
          </span>
          {/* Spans, not <p> — a button may only contain phrasing content. */}
          <span className="hidden leading-tight sm:block">
            <span className="block text-base font-bold tracking-tight">
              Watch<span className="text-primary">Bridge</span>
            </span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              search · compare · act
            </span>
          </span>
        </button>

        <PrimaryNav
          view={view}
          onChange={onViewChange}
          shortlistCount={shortlistCount}
          watchedCount={watchedCount}
        />

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenCommandPalette}
                aria-label="Search titles or run a command"
                className="h-10 min-w-10 px-2 lg:h-8 lg:min-w-0 lg:px-3"
              >
                <Search />
                <span className="hidden lg:inline">Quick find</span>
                <kbd className="hidden border border-border bg-background px-1.5 py-0.5 text-[9px] text-muted-foreground xl:inline">
                  ⌘K
                </kbd>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quick find · ⌘/Ctrl K or /</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSettings}
                aria-label="Open settings"
              >
                <Settings />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
