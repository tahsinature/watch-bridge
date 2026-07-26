import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabeledBlock, LabeledRow } from "./LabeledRow";
import { PosterActions } from "./PosterActions";
import { ActionBar } from "@/components/actions/ActionBar";
import { ShortlistButton } from "@/components/library/ShortlistButton";
import { WatchedDialog } from "@/components/library/WatchedDialog";
import { useLibrary } from "@/stores/library";
import { toast } from "@/stores/toast";
import { fromDetails, itemKey } from "@/lib/library";
import type { TitleDetails } from "@/types";

/** Every action for a title, grouped into labeled rows. */
export function ActionsPanel({ details }: { details: TitleDetails }) {
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
      <LabeledBlock>
        <LabeledRow label="Library">
          <div className="flex flex-wrap gap-2">
            <ShortlistButton item={base} showLabel />
            <Button
              variant={isWatched ? "gold" : "secondary"}
              size="sm"
              onClick={() => setWatchedOpen(true)}
            >
              <Eye className="size-4" />
              {isWatched ? "Watched" : "Mark watched"}
            </Button>
          </div>
        </LabeledRow>

        <ActionBar details={details} />

        <LabeledRow label="Poster">
          <PosterActions
            posterPath={details.posterPath}
            title={details.title}
            year={details.year}
          />
        </LabeledRow>
      </LabeledBlock>

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
