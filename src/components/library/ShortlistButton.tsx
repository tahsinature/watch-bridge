import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLibrary, useInLibrary } from "@/stores/library";
import { toast } from "@/stores/toast";
import type { LibraryItem } from "@/types";

interface ShortlistButtonProps {
  item: LibraryItem;
  showLabel?: boolean;
}

/** Toggle a title in/out of the library (adds to shortlist when absent). */
export function ShortlistButton({ item, showLabel }: ShortlistButtonProps) {
  const inLibrary = useInLibrary(item.id, item.mediaType);
  const addToShortlist = useLibrary((s) => s.addToShortlist);
  const remove = useLibrary((s) => s.remove);

  const toggle = () => {
    if (inLibrary) {
      remove(item.id, item.mediaType);
      toast("Removed from library");
    } else {
      addToShortlist(item);
      toast("Added to shortlist", "success");
    }
  };

  return (
    <Button
      variant={inLibrary ? "gold" : "secondary"}
      size={showLabel ? "sm" : "icon-sm"}
      onClick={toggle}
      aria-label={inLibrary ? "Remove from library" : "Add to shortlist"}
    >
      {inLibrary ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showLabel && (inLibrary ? "Shortlisted" : "Shortlist")}
    </Button>
  );
}
