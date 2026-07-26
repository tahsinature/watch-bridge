import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import type { LibraryItem } from "@/types";

interface WatchedDialogProps {
  item: LibraryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (rating: number | null, notes: string) => void;
}

/** Rate + note a title when marking it watched (or editing a watched entry). */
export function WatchedDialog({ item, open, onOpenChange, onSave }: WatchedDialogProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  // Seed the form whenever a new item is opened.
  useEffect(() => {
    if (item) {
      setRating(item.userRating);
      setNotes(item.notes);
    }
  }, [item]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {item?.status === "watched" ? "Edit watched entry" : "Mark as watched"}
          </DialogTitle>
          <DialogDescription>
            {item?.title}
            {item?.year ? ` (${item.year})` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label>Your rating</Label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="watched-notes">Notes</Label>
            <Textarea
              id="watched-notes"
              value={notes}
              placeholder="What did you think? Anything to remember…"
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[96px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(rating, notes);
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
