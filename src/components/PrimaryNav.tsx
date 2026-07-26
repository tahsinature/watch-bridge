import { Bookmark, Eye, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type View = "search" | "shortlist" | "watched";

interface PrimaryNavProps {
  view: View;
  onChange: (view: View) => void;
  shortlistCount: number;
  watchedCount: number;
}

export function PrimaryNav({
  view,
  onChange,
  shortlistCount,
  watchedCount,
}: PrimaryNavProps) {
  const tabs: { id: View; label: string; icon: typeof Search; count?: number }[] = [
    { id: "search", label: "Search", icon: Search },
    { id: "shortlist", label: "Shortlist", icon: Bookmark, count: shortlistCount },
    { id: "watched", label: "Watched", icon: Eye, count: watchedCount },
  ];

  return (
    <div className="inline-flex items-center border border-border">
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const active = view === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors",
              index > 0 && "border-l border-border",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count ? (
              <span
                className={cn(
                  "ml-0.5 min-w-4 px-1 text-[10px] font-semibold leading-4",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-secondary text-foreground",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
