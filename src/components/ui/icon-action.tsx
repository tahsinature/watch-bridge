import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface IconActionProps {
  /** Serves as both the tooltip and the accessible name. */
  label: string;
  onClick: () => void;
  variant?: "secondary" | "outline" | "ghost";
  destructive?: boolean;
  children: React.ReactNode;
}

/** Icon-only button whose meaning comes from its tooltip. */
export function IconAction({
  label,
  onClick,
  variant = "ghost",
  destructive,
  children,
}: IconActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size="icon-sm"
          onClick={onClick}
          aria-label={label}
          className={cn(
            destructive && "text-muted-foreground hover:text-destructive",
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
