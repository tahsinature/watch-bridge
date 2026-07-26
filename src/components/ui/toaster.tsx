import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToasts, type ToastVariant } from "@/stores/toast";
import { cn } from "@/lib/utils";

const variantStyles: Record<ToastVariant, { ring: string; icon: JSX.Element }> = {
  default: {
    ring: "border-border",
    icon: <Info className="h-4 w-4 text-primary" />,
  },
  success: {
    ring: "border-emerald-500/40",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  },
  error: {
    ring: "border-destructive/50",
    icon: <XCircle className="h-4 w-4 text-destructive" />,
  },
};

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-xs flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "pointer-events-auto flex items-center gap-2.5 border bg-popover px-3.5 py-2.5 text-sm shadow-xl",
              variantStyles[t.variant].ring,
            )}
          >
            {variantStyles[t.variant].icon}
            <span className="flex-1 text-foreground/90">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
