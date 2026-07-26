import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, NotebookPen, Pencil, Trash2, Undo2 } from "lucide-react";
import { WatchedDialog } from "./WatchedDialog";
import { Button } from "@/components/ui/button";
import { PosterImage } from "@/components/ui/poster-image";
import { StarRating } from "@/components/ui/star-rating";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLibrary } from "@/stores/library";
import { useSettings } from "@/stores/settings";
import { toast } from "@/stores/toast";
import { logToNotion } from "@/lib/notion";
import { formatDate, itemKey } from "@/lib/library";
import type { LibraryItem, SelectionRef } from "@/types";

export function WatchedView({ onSelect }: { onSelect: (ref: SelectionRef) => void }) {
  const items = useLibrary((s) => s.items);
  const update = useLibrary((s) => s.update);
  const remove = useLibrary((s) => s.remove);
  const returnToShortlist = useLibrary((s) => s.returnToShortlist);
  const notionUrl = useSettings((s) => s.notionUrl);

  const watched = useMemo(
    () =>
      items
        .filter((i) => i.status === "watched")
        .sort((a, b) => (b.watchedAt ?? 0) - (a.watchedAt ?? 0)),
    [items],
  );

  const [editTarget, setEditTarget] = useState<LibraryItem | null>(null);

  if (watched.length === 0) return <EmptyWatched />;

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
              onOpen={() =>
                onSelect({ id: item.id, mediaType: item.mediaType, title: item.title })
              }
              onEdit={() => setEditTarget(item)}
              onNotion={() => void logToNotion(item, notionUrl)}
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
  onNotion: () => void;
  onReturn: () => void;
  onRemove: () => void;
}

function WatchedRow({ item, onOpen, onEdit, onNotion, onReturn, onRemove }: WatchedRowProps) {
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
        className="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary"
      >
        <PosterImage path={item.posterPath} alt={item.title} size="w185" />
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
          <RowAction label="Edit" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </RowAction>
          <RowAction label="Log to Notion" onClick={onNotion}>
            <NotebookPen className="h-4 w-4" />
          </RowAction>
          <RowAction label="Move back to shortlist" onClick={onReturn}>
            <Undo2 className="h-4 w-4" />
          </RowAction>
          <RowAction label="Remove" onClick={onRemove} destructive>
            <Trash2 className="h-4 w-4" />
          </RowAction>
        </div>
      </div>
    </motion.div>
  );
}

function RowAction({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          aria-label={label}
          className={destructive ? "text-muted-foreground hover:text-destructive" : ""}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function EmptyWatched() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
        <Eye className="h-7 w-7" />
      </span>
      <div>
        <p className="text-lg font-semibold">Nothing logged yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Mark titles as watched to rate them, jot notes, and log them to Notion.
        </p>
      </div>
    </div>
  );
}
