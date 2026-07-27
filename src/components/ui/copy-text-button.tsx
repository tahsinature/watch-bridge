import { Check, Copy } from "lucide-react";
import { useCopiedFlag } from "@/hooks/useCopiedFlag";
import { toast } from "@/stores/toast";

interface CopyTextButtonProps {
  value: string;
  label: string;
  toastMessage: string;
}

/** Small inline "copy this text" control for section headers. */
export function CopyTextButton({ value, label, toastMessage }: CopyTextButtonProps) {
  const [copied, flagCopied] = useCopiedFlag();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    flagCopied();
    toast(toastMessage, "success");
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {label}
    </button>
  );
}
