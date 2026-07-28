import { useMemo, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";
import { ApiKeyGate } from "@/components/ApiKeyGate";
import { SettingsDialog } from "@/components/SettingsDialog";
import { SearchView } from "@/components/search/SearchView";
import { ShortlistView } from "@/components/library/ShortlistView";
import { WatchedView } from "@/components/library/WatchedView";
import { MovieDetail } from "@/components/detail/MovieDetail";
import { PersonDetail } from "@/components/detail/PersonDetail";
import { useUrlState } from "@/hooks/useUrlState";
import { useHasApiKey } from "@/stores/settings";
import { useLibrary } from "@/stores/library";

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [homeKey, setHomeKey] = useState(0);
  const { view, selection, person, setView, setSelection, setPerson } =
    useUrlState();
  const hasApiKey = useHasApiKey();
  const canShowDetails = hasApiKey && !settingsOpen;

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
            <SearchView key={homeKey} onSelect={setSelection} />
          ) : view === "shortlist" ? (
            <ShortlistView onSelect={setSelection} />
          ) : (
            <WatchedView onSelect={setSelection} />
          )}
        </main>

        <MovieDetail
          selected={canShowDetails ? selection : null}
          onClose={() => setSelection(null)}
          onSelectTitle={setSelection}
          onSelectPerson={setPerson}
        />
        <PersonDetail
          person={canShowDetails ? person : null}
          onClose={() => setPerson(null)}
          onSelectTitle={setSelection}
        />
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
