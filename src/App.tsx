import { useMemo, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";
import { type View } from "@/components/PrimaryNav";
import { ApiKeyGate } from "@/components/ApiKeyGate";
import { SettingsDialog } from "@/components/SettingsDialog";
import { SearchView } from "@/components/search/SearchView";
import { ShortlistView } from "@/components/library/ShortlistView";
import { WatchedView } from "@/components/library/WatchedView";
import { MovieDetail } from "@/components/detail/MovieDetail";
import { useHasApiKey } from "@/stores/settings";
import { useLibrary } from "@/stores/library";
import type { SelectionRef } from "@/types";

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [view, setView] = useState<View>("search");
  const [selected, setSelected] = useState<SelectionRef | null>(null);
  const [homeKey, setHomeKey] = useState(0);
  const hasApiKey = useHasApiKey();

  /**
   * Clicking the brand returns to a clean Search view. SearchView owns its
   * query, so bumping its key remounts it — that's what clears a typed search
   * when you're already on this view.
   */
  const goHome = () => {
    setView("search");
    setHomeKey((key) => key + 1);
  };

  const items = useLibrary((s) => s.items);
  const counts = useMemo(
    () => ({
      shortlist: items.filter((i) => i.status === "shortlist").length,
      watched: items.filter((i) => i.status === "watched").length,
    }),
    [items],
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen">
        <Header
          view={view}
          onViewChange={setView}
          onGoHome={goHome}
          shortlistCount={counts.shortlist}
          watchedCount={counts.watched}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <main className="container py-8">
          {!hasApiKey ? (
            <ApiKeyGate onOpenSettings={() => setSettingsOpen(true)} />
          ) : view === "search" ? (
            <SearchView key={homeKey} onSelect={setSelected} />
          ) : view === "shortlist" ? (
            <ShortlistView onSelect={setSelected} />
          ) : (
            <WatchedView onSelect={setSelected} />
          )}
        </main>

        <MovieDetail selected={selected} onClose={() => setSelected(null)} />
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
