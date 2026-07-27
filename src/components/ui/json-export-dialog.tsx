import { Check, Copy, Download } from "lucide-react";
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
import { useCopiedFlag } from "@/hooks/useCopiedFlag";
import { downloadJson } from "@/lib/download";
import { toast } from "@/stores/toast";

interface JsonExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  filename: string;
  data: unknown;
  /** Extra controls above the preview — e.g. what to include in the payload. */
  children?: React.ReactNode;
}

/**
 * Shows the payload and offers both routes out: copy the JSON, or save a file.
 * Pasting into a chat or another browser's import box is often quicker than
 * moving a file around.
 */
export function JsonExportDialog({
  open,
  onOpenChange,
  title,
  description,
  filename,
  data,
  children,
}: JsonExportDialogProps) {
  const [copied, flagCopied] = useCopiedFlag();
  const json = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    flagCopied();
    toast("JSON copied", "success");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}

        <Textarea
          readOnly
          value={json}
          spellCheck={false}
          onFocus={(event) => event.currentTarget.select()}
          className="h-56 font-mono text-[11px] leading-relaxed"
        />

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy JSON
          </Button>
          <Button
            onClick={() => {
              downloadJson(filename, data);
              toast("File downloaded", "success");
            }}
          >
            <Download className="h-4 w-4" />
            Download file
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
