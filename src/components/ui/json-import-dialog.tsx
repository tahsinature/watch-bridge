import { useEffect, useRef, useState } from "react";
import { AlertCircle, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface JsonImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  /** Red confirm button for imports that overwrite existing data. */
  destructive?: boolean;
  /**
   * Apply the parsed JSON. Return a message to keep the dialog open and show
   * it inline — the pasted text stays put so it can be corrected.
   */
  onImport: (data: unknown) => string | void;
}

/**
 * Paste JSON or pick a file — a file just fills the box, so its contents can
 * be reviewed before anything is overwritten. Doubles as the confirmation
 * step, since the warning sits right above the button that acts on it.
 */
export function JsonImportDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Import",
  destructive,
  onImport,
}: JsonImportDialogProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Start clean each time rather than showing the last attempt.
  useEffect(() => {
    if (open) {
      setText("");
      setError("");
    }
  }, [open]);

  const handleImport = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setError("That isn't valid JSON — check for a missing bracket or comma.");
      return;
    }
    const message = onImport(parsed);
    if (message) {
      setError(message);
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <Textarea
          autoFocus
          value={text}
          spellCheck={false}
          placeholder="Paste JSON here…"
          onChange={(event) => {
            setText(event.target.value);
            setError("");
          }}
          className="h-56 font-mono text-[11px] leading-relaxed"
        />

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Choose file…
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              // Cleared eagerly so picking the same file twice still fires.
              event.target.value = "";
              if (!file) return;
              setText(await file.text());
              setError("");
            }}
          />
          {error && (
            <p className="flex min-w-0 items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="size-3.5 shrink-0" />
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={text.trim().length === 0}
            onClick={handleImport}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
