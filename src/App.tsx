import { useEffect, useMemo, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";
import { CommandPalette } from "@/components/CommandPalette";
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
import { finishStatePortCallback } from "@/lib/statePort";
import { toast } from "@/stores/toast";

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [homeKey, setHomeKey] = useState(0);
  const { view, selection, person, setView, setSelection, setPerson } =
    useUrlState();
  const hasApiKey = useHasApiKey();
  const canShowDetails = hasApiKey && !settingsOpen;

  useEffect(() => {
    void finishStatePortCallback()
      .then((connected) => {
        if (connected) {
          toast("Connected to local State Port. Open Settings to load or save.", "success");
          setSettingsOpen(true);
        }
      })
      .catch((error) => toast(error instanceof Error ? error.message : "State Port connection failed", "error"));
  }, []);

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
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
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
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />
        <PersonDetail
          person={canShowDetails ? person : null}
          onClose={() => setPerson(null)}
          onSelectTitle={setSelection}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        <CommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
          view={view}
          selection={selection}
          onGoHome={goHome}
          onViewChange={setView}
          onSelectTitle={setSelection}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
