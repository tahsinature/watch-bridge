import { Check, Copy } from "lucide-react";
import { IconAction } from "@/components/ui/icon-action";
import { useCopiedFlag } from "@/hooks/useCopiedFlag";
import { toast } from "@/stores/toast";

interface CopyTextButtonProps {
  value: string;
  label: string;
  toastMessage: string;
}

/** Compact icon action for copying a nearby block of text. */
export function CopyTextButton({ value, label, toastMessage }: CopyTextButtonProps) {
  const [copied, flagCopied] = useCopiedFlag();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    flagCopied();
    toast(toastMessage, "success");
  };

  return (
    <IconAction label={label} onClick={() => void handleCopy()}>
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </IconAction>
  );
}
