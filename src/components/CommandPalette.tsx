import { useEffect, useMemo, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WatchedDialog } from "@/components/library/WatchedDialog";
import { CurrentTitleCommands } from "@/components/command-palette/CurrentTitleCommands";
import { NavigationCommands } from "@/components/command-palette/NavigationCommands";
import { TitleResultCommands } from "@/components/command-palette/TitleResultCommands";
import { useDebounce } from "@/hooks/useDebounce";
import { useDetails, useSearch } from "@/hooks/useTmdb";
import { buildContext, type ActionContext } from "@/lib/placeholders";
import { fromDetails, sameTitle, toSelectionRef } from "@/lib/library";
import { runAction } from "@/lib/runAction";
import { sortResults } from "@/lib/sort";
import { filterByMinimumVotes } from "@/lib/voteFilter";
import { useActions } from "@/stores/actions";
import { useLibrary } from "@/stores/library";
import { useRecentTitles } from "@/stores/recentTitles";
import { useSettings } from "@/stores/settings";
import { toast } from "@/stores/toast";
import type {
  ActionDef,
  LibraryItem,
  SearchResult,
  SelectionRef,
  View,
} from "@/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: View;
  selection: SelectionRef | null;
  onGoHome: () => void;
  onViewChange: (view: View) => void;
  onSelectTitle: (selection: SelectionRef) => void;
  onOpenSettings: () => void;
}

interface PendingAction {
  action: ActionDef;
  context: ActionContext;
}

const MAX_TITLE_RESULTS = 10;

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT")
  );
}

export function CommandPalette({
  open,
  onOpenChange,
  view,
  selection,
  onGoHome,
  onViewChange,
  onSelectTitle,
  onOpenSettings,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [watchedItem, setWatchedItem] = useState<LibraryItem | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const trimmedQuery = query.trim();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const commandShortcut =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      const searchShortcut =
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isEditableTarget(event.target);

      if (!commandShortcut && !searchShortcut) return;
      event.preventDefault();
      if (commandShortcut && open) {
        onOpenChange(false);
        setQuery("");
        return;
      }
      onOpenChange(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) setQuery("");
  };

  const closePalette = () => handleOpenChange(false);

  const { data: currentDetails } = useDetails(
    selection?.mediaType,
    selection?.id,
    open && selection !== null,
  );
  const actionContext = useMemo(
    () => (currentDetails ? buildContext(currentDetails) : null),
    [currentDetails],
  );

  const apiKey = useSettings((state) => state.tmdbApiKey);
  const sortOrder = useSettings((state) => state.sortOrder);
  const minimumVotes = useSettings((state) => state.minimumVotes);
  const searchQuery = open ? debouncedQuery : "";
  const search = useSearch(searchQuery);
  const titleResults = useMemo(
    () =>
      sortResults(
        filterByMinimumVotes(search.data ?? [], minimumVotes),
        sortOrder,
      ).slice(0, MAX_TITLE_RESULTS),
    [minimumVotes, search.data, sortOrder],
  );

  const actions = useActions((state) => state.actions);
  const enabledActions = useMemo(
    () => actions.filter((action) => action.enabled),
    [actions],
  );
  const libraryItem = useLibrary((state) =>
    currentDetails
      ? state.items.find((item) => sameTitle(item, currentDetails))
      : undefined,
  );
  const addToShortlist = useLibrary((state) => state.addToShortlist);
  const removeFromLibrary = useLibrary((state) => state.remove);
  const markWatched = useLibrary((state) => state.markWatched);
  const recordRecentTitle = useRecentTitles((state) => state.record);

  const baseLibraryItem = useMemo(
    () =>
      currentDetails ? libraryItem ?? fromDetails(currentDetails) : null,
    [currentDetails, libraryItem],
  );

  const chooseTitle = (result: SearchResult) => {
    recordRecentTitle({
      id: result.id,
      mediaType: result.mediaType,
      title: result.title,
      year: result.year,
      posterPath: result.posterPath,
    });
    closePalette();
    onSelectTitle(toSelectionRef(result));
  };

  const navigate = (nextView: View) => {
    closePalette();
    if (nextView === "search") onGoHome();
    else onViewChange(nextView);
  };

  const triggerConfiguredAction = (action: ActionDef) => {
    if (!actionContext) return;
    closePalette();
    if (action.confirm) {
      setPendingAction({ action, context: actionContext });
      return;
    }
    void runAction(action, actionContext);
  };

  const toggleLibrary = () => {
    if (!currentDetails || !baseLibraryItem) return;
    closePalette();
    if (libraryItem) {
      removeFromLibrary(currentDetails.id, currentDetails.mediaType);
      toast("Removed from library");
      return;
    }
    addToShortlist(baseLibraryItem);
    toast("Added to shortlist", "success");
  };

  const openWatchedDialog = () => {
    if (!baseLibraryItem) return;
    closePalette();
    setWatchedItem(baseLibraryItem);
  };

  const searchIsSettling =
    trimmedQuery.length >= 2 && debouncedQuery.trim() !== trimmedQuery;
  const emptyMessage =
    apiKey.length === 0
      ? "Add a TMDB API key in Settings to search titles."
      : trimmedQuery.length < 2
        ? "Type at least two characters to search titles."
        : searchIsSettling || search.isFetching
          ? "Searching TMDB…"
          : "No matching commands or titles.";

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">WatchBridge command palette</DialogTitle>
          <DialogDescription className="sr-only">
            Search movies and series or run an action.
          </DialogDescription>

          <Command loop>
            <CommandInput
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search titles or run a command…"
              aria-label="Search titles or run a command"
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>

              {currentDetails && actionContext ? (
                <CurrentTitleCommands
                  details={currentDetails}
                  libraryItem={libraryItem}
                  actions={enabledActions}
                  onClosePalette={closePalette}
                  onToggleLibrary={toggleLibrary}
                  onOpenWatchedDialog={openWatchedDialog}
                  onTriggerConfiguredAction={triggerConfiguredAction}
                />
              ) : null}

              <NavigationCommands
                view={view}
                onNavigate={navigate}
                onOpenSettings={() => {
                  closePalette();
                  onOpenSettings();
                }}
              />

              <TitleResultCommands
                results={titleResults}
                searching={search.isFetching}
                onSelect={chooseTitle}
              />
            </CommandList>

            <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span><kbd>↑↓</kbd> Navigate</span>
              <span><kbd>↵</kbd> Select</span>
              <span className="ml-auto"><kbd>Esc</kbd> Close</span>
            </div>
          </Command>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingAction !== null}
        title={`Run “${pendingAction?.action.name}”?`}
        description={
          pendingAction?.action.type === "http-request"
            ? "This sends a live network request to the endpoint you configured."
            : "This will launch an external action."
        }
        confirmLabel="Run"
        onConfirm={() => {
          if (pendingAction) {
            void runAction(pendingAction.action, pendingAction.context);
          }
        }}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setPendingAction(null);
        }}
      />

      <WatchedDialog
        item={watchedItem}
        open={watchedItem !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWatchedItem(null);
        }}
        onSave={(rating, notes) => {
          if (!watchedItem) return;
          markWatched(watchedItem, rating, notes);
          toast("Saved to watched", "success");
        }}
      />
    </>
  );
}
