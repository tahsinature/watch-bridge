import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShortlistButton } from "@/components/library/ShortlistButton";
import { WatchedDialog } from "@/components/library/WatchedDialog";
import { useLibrary } from "@/stores/library";
import { toast } from "@/stores/toast";
import { fromDetails, itemKey } from "@/lib/library";
import type { TitleDetails } from "@/types";

/**
 * Shortlist + mark-watched for one title. Buttons fill their row on phones,
 * where this sits in the sheet's sticky bar, and size naturally from sm up,
 * where it sits in the Actions panel — the two placements never overlap.
 */
export function LibraryActions({ details }: { details: TitleDetails }) {
  const libraryItem = useLibrary((s) =>
    s.items.find(
      (i) => itemKey(i.id, i.mediaType) === itemKey(details.id, details.mediaType),
    ),
  );
  const markWatched = useLibrary((s) => s.markWatched);
  const base = useMemo(
    () => libraryItem ?? fromDetails(details),
    [libraryItem, details],
  );
  const isWatched = libraryItem?.status === "watched";
  const [watchedOpen, setWatchedOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <ShortlistButton item={base} showLabel className="flex-1 sm:flex-none" />
        <Button
          variant={isWatched ? "gold" : "secondary"}
          size="sm"
          onClick={() => setWatchedOpen(true)}
          className="flex-1 sm:flex-none"
        >
          <Eye className="size-4" />
          {isWatched ? "Watched" : "Mark watched"}
        </Button>
      </div>

      <WatchedDialog
        item={watchedOpen ? base : null}
        open={watchedOpen}
        onOpenChange={setWatchedOpen}
        onSave={(rating, notes) => {
          markWatched(base, rating, notes);
          toast("Saved to watched", "success");
        }}
      />
    </>
  );
}
