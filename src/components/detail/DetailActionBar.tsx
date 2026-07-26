import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryActions } from "./LibraryActions";
import type { TitleDetails } from "@/types";

/**
 * Pinned to the bottom of the detail view at every size. The sheet fills the
 * viewport, so there's no backdrop left to click for dismissal — Close has to
 * be permanently in reach, and the library actions earn their place beside it
 * rather than sitting below two sections of metadata.
 */
export function DetailActionBar({
  details,
  onClose,
}: {
  details: TitleDetails;
  onClose: () => void;
}) {
  return (
    <div className="border-t border-border bg-card">
      <div
        /* Bottom padding clears the home indicator on phones that have one. */
        className="mx-auto flex max-w-3xl flex-col gap-2 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-3"
      >
        <LibraryActions details={details} />
        <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
          <X className="size-4" />
          Close
        </Button>
      </div>
    </div>
  );
}
