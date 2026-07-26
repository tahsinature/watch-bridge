import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { GitCompareArrows, ListPlus } from "lucide-react";
import { ShortlistCard } from "./ShortlistCard";
import { CompareView } from "./CompareView";
import { WatchedDialog } from "./WatchedDialog";
import { ContentLevelFilter } from "./ContentLevelFilter";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useLibrary } from "@/stores/library";
import { toast } from "@/stores/toast";
import { itemKey, toSelectionRef } from "@/lib/library";
import type { LibraryItem, SelectionRef } from "@/types";

const MAX_COMPARE = 4;

export function ShortlistView({ onSelect }: { onSelect: (ref: SelectionRef) => void }) {
  const items = useLibrary((s) => s.items);
  const remove = useLibrary((s) => s.remove);
  const markWatched = useLibrary((s) => s.markWatched);

  const shortlist = useMemo(
    () => items.filter((i) => i.status === "shortlist"),
    [items],
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [watchedTarget, setWatchedTarget] = useState<LibraryItem | null>(null);

  const toggleSelect = (item: LibraryItem) => {
    const key = itemKey(item.id, item.mediaType);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else if (next.size >= MAX_COMPARE) {
        toast(`Compare up to ${MAX_COMPARE} titles at once`, "error");
        return prev;
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const compareItems = shortlist.filter((i) =>
    selected.has(itemKey(i.id, i.mediaType)),
  );

  if (shortlist.length === 0) {
    return (
      <EmptyState
        icon={ListPlus}
        title="Your shortlist is empty"
        detail="Search for titles and tap the bookmark to line them up here for comparison."
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Wraps rather than overflowing — three controls don't fit a phone row. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          Shortlist
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {shortlist.length}
          </span>
        </h2>
        <div className="flex min-w-0 items-center gap-3">
          <ContentLevelFilter />
          <Button
            size="sm"
            className="shrink-0"
            disabled={selected.size < 2}
            onClick={() => setCompareOpen(true)}
          >
            <GitCompareArrows className="size-4" />
            Compare{selected.size > 0 ? ` (${selected.size})` : ""}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <AnimatePresence>
          {shortlist.map((item) => (
            <ShortlistCard
              key={itemKey(item.id, item.mediaType)}
              item={item}
              selected={selected.has(itemKey(item.id, item.mediaType))}
              onToggleSelect={() => toggleSelect(item)}
              onOpen={() => onSelect(toSelectionRef(item))}
              onWatched={() => setWatchedTarget(item)}
              onRemove={() => remove(item.id, item.mediaType)}
            />
          ))}
        </AnimatePresence>
      </div>

      <CompareView
        items={compareItems}
        open={compareOpen}
        onOpenChange={setCompareOpen}
        onRemoveItem={(item) => toggleSelect(item)}
        onOpenDetail={(item) => {
          setCompareOpen(false);
          onSelect(toSelectionRef(item));
        }}
      />

      <WatchedDialog
        item={watchedTarget}
        open={!!watchedTarget}
        onOpenChange={(open) => !open && setWatchedTarget(null)}
        onSave={(rating, notes) => {
          if (watchedTarget) {
            markWatched(watchedTarget, rating, notes);
            toast("Moved to watched", "success");
          }
        }}
      />
    </div>
  );
}
