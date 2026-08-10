import { useState } from "react";
import { CalendarDays, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopiedFlag } from "@/hooks/useCopiedFlag";
import { copyTitle, copyTitleAndYear } from "@/lib/titleActions";

export function CopyTitleMenu({
  title,
  year,
}: {
  title: string;
  year: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, flagCopied] = useCopiedFlag();

  const runCopy = (includeYear: boolean) => {
    setOpen(false);
    const action = includeYear ? copyTitleAndYear : copyTitle;
    void action({ title, year }).then(flagCopied);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Copy title options"
            >
              {copied ? <Check /> : <Copy />}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Copy title</TooltipContent>
      </Tooltip>

      <PopoverContent align="start" className="w-56">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            onClick={() => runCopy(false)}
            className="w-full justify-start"
          >
            <Copy />
            Copy title
          </Button>
          <Button
            variant="ghost"
            onClick={() => runCopy(true)}
            className="w-full justify-start"
          >
            <CalendarDays />
            Copy title + year
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
