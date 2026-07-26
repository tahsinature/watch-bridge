import { motion } from "framer-motion";
import { KeyRound, Search, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiKeyGateProps {
  onOpenSettings: () => void;
}

const features = [
  { icon: Search, label: "Search any movie or series" },
  { icon: Sparkles, label: "Posters, trailers & bullet breakdowns" },
  { icon: Wand2, label: "Your own download & search actions" },
];

/**
 * First-run onboarding shown until a TMDB key is present. Deliberately warm
 * and low-friction: one button to the only required setup step.
 */
export function ApiKeyGate({ onOpenSettings }: ApiKeyGateProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass w-full max-w-md rounded-3xl border border-border p-8 text-center shadow-2xl"
      >
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
          <KeyRound className="h-7 w-7" />
        </div>

        <h1 className="text-xl font-bold tracking-tight">Welcome to WatchBridge</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          One quick step: add a free TMDB API key. It stays in your browser and powers
          all searches.
        </p>

        <ul className="mx-auto mt-6 space-y-2.5 text-left">
          {features.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-foreground/90">{label}</span>
            </li>
          ))}
        </ul>

        <Button onClick={onOpenSettings} size="lg" className="mt-7 w-full">
          <KeyRound className="h-4 w-4" />
          Add your TMDB key
        </Button>
      </motion.div>
    </div>
  );
}
