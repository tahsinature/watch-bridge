import { Command as CommandIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryActions } from "./LibraryActions";
import type { TitleDetails } from "@/types";

/**
 * Pinned to the bottom of the detail view at every size. The sheet fills the
 * viewport, so there's no backdrop left to click for dismissal — Close and
 * the global quick-find entry have to stay in reach. Library actions sit beside
 * them rather than below two sections of metadata.
 *
 * `details` is omitted by the person sheet, which has nothing to shortlist.
 */
export function DetailActionBar({
  details,
  onClose,
  onOpenCommandPalette,
}: {
  details?: TitleDetails;
  onClose: () => void;
  onOpenCommandPalette: () => void;
}) {
  return (
    <div className="border-t border-border bg-card">
      <div
        /* Bottom padding clears the home indicator on phones that have one. */
        className="mx-auto flex max-w-3xl flex-col gap-2 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-3"
      >
        {details && <LibraryActions details={details} />}
        <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
          <Button
            variant="secondary"
            onClick={onOpenCommandPalette}
            className="flex-1 sm:flex-none"
          >
            <CommandIcon />
            Quick find
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            <X />
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
