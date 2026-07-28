import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Pencil, Trash2, Undo2 } from "lucide-react";
import { WatchedDialog } from "./WatchedDialog";
import { AdultBadge } from "@/components/ui/adult-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { IconAction } from "@/components/ui/icon-action";
import { PosterImage } from "@/components/ui/poster-image";
import { StarRating } from "@/components/ui/star-rating";
import { useLibrary } from "@/stores/library";
import { toast } from "@/stores/toast";
import { formatDate, itemKey, toSelectionRef } from "@/lib/library";
import type { LibraryItem, SelectionRef } from "@/types";

export function WatchedView({ onSelect }: { onSelect: (ref: SelectionRef) => void }) {
  const items = useLibrary((s) => s.items);
  const update = useLibrary((s) => s.update);
  const remove = useLibrary((s) => s.remove);
  const returnToShortlist = useLibrary((s) => s.returnToShortlist);

  const watched = useMemo(
    () =>
      items
        .filter((i) => i.status === "watched")
        .sort((a, b) => (b.watchedAt ?? 0) - (a.watchedAt ?? 0)),
    [items],
  );

  const [editTarget, setEditTarget] = useState<LibraryItem | null>(null);

  if (watched.length === 0) {
    return (
      <EmptyState
        icon={Eye}
        title="Nothing logged yet"
        detail="Mark titles as watched to rate them and jot down your notes."
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-lg font-semibold">
        Watched
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          {watched.length}
        </span>
      </h2>

      <div className="space-y-3">
        <AnimatePresence>
          {watched.map((item) => (
            <WatchedRow
              key={itemKey(item.id, item.mediaType)}
              item={item}
              onOpen={() => onSelect(toSelectionRef(item))}
              onEdit={() => setEditTarget(item)}
              onReturn={() => {
                returnToShortlist(item.id, item.mediaType);
                toast("Back on the shortlist");
              }}
              onRemove={() => remove(item.id, item.mediaType)}
            />
          ))}
        </AnimatePresence>
      </div>

      <WatchedDialog
        item={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSave={(rating, notes) => {
          if (editTarget) {
            update(editTarget.id, editTarget.mediaType, {
              userRating: rating,
              notes,
            });
            toast("Entry updated", "success");
          }
        }}
      />
    </div>
  );
}

interface WatchedRowProps {
  item: LibraryItem;
  onOpen: () => void;
  onEdit: () => void;
  onReturn: () => void;
  onRemove: () => void;
}

function WatchedRow({ item, onOpen, onEdit, onReturn, onRemove }: WatchedRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-sm"
    >
      <button
        onClick={onOpen}
        className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary"
      >
        <PosterImage path={item.posterPath} alt={item.title} size="w185" />
        <AdultBadge adult={item.adult} className="absolute bottom-1 right-1" />
      </button>

      <div className="flex min-w-0 flex-1 flex-col">
        <button onClick={onOpen} className="text-left">
          <p className="truncate font-semibold leading-snug">{item.title}</p>
          <p className="text-xs text-muted-foreground">
            {item.year} · {item.mediaType === "tv" ? "Series" : "Film"}
            {item.watchedAt ? ` · watched ${formatDate(item.watchedAt)}` : ""}
          </p>
        </button>

        <div className="mt-1.5">
          <StarRating value={item.userRating} size="sm" />
        </div>

        {item.notes && (
          <p className="mt-1.5 line-clamp-2 text-sm text-foreground/70">
            {item.notes}
          </p>
        )}

        <div className="mt-auto flex items-center gap-1 pt-2">
          <IconAction label="Edit" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </IconAction>
          <IconAction label="Move back to shortlist" onClick={onReturn}>
            <Undo2 className="h-4 w-4" />
          </IconAction>
          <IconAction label="Remove" onClick={onRemove} destructive>
            <Trash2 className="h-4 w-4" />
          </IconAction>
        </div>
      </div>
    </motion.div>
  );
}
