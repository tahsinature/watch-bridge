import { Clapperboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PrimaryNav, type View } from "@/components/PrimaryNav";

interface HeaderProps {
  view: View;
  onViewChange: (view: View) => void;
  shortlistCount: number;
  watchedCount: number;
  onOpenSettings: () => void;
}

export function Header({
  view,
  onViewChange,
  shortlistCount,
  watchedCount,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center border border-primary/30 bg-primary/10 text-primary">
            <Clapperboard className="size-5" />
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-base font-bold tracking-tight">
              Watch<span className="text-primary">Bridge</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              search · compare · act
            </p>
          </div>
        </div>

        <PrimaryNav
          view={view}
          onChange={onViewChange}
          shortlistCount={shortlistCount}
          watchedCount={watchedCount}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
              aria-label="Open settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
