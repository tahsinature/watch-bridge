import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryActions } from "./LibraryActions";
import type { TitleDetails } from "@/types";

/**
 * Pinned to the bottom of the sheet on phones. The dialog's top-right × is a
 * long thumb reach on a tall screen, so the primary exit sits down here — and
 * the library actions come along, since they're the ones worth reaching for
 * without scrolling. Hidden from sm up, where the corner × is easy to hit.
 */
export function MobileActionBar({
  details,
  onClose,
}: {
  details: TitleDetails;
  onClose: () => void;
}) {
  return (
    <div
      /* Clears the home indicator on phones that have one. */
      className="flex flex-col gap-2 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden"
    >
      <LibraryActions details={details} />
      <Button variant="secondary" onClick={onClose} className="w-full">
        <X className="size-4" />
        Close
      </Button>
    </div>
  );
}
