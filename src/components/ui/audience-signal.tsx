import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatVotes } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AudienceTier {
  level: 1 | 2 | 3 | 4;
  label: string;
  range: string;
  maxVotes: number | null;
  color: string;
}

const AUDIENCE_TIERS: AudienceTier[] = [
  {
    level: 1,
    label: "Limited audience",
    range: "Under 1,000",
    maxVotes: 999,
    color: "text-slate-300",
  },
  {
    level: 2,
    label: "Established",
    range: "1,000–4,999",
    maxVotes: 4_999,
    color: "text-sky-300",
  },
  {
    level: 3,
    label: "Popular",
    range: "5,000–14,999",
    maxVotes: 14_999,
    color: "text-cyan-300",
  },
  {
    level: 4,
    label: "Widely rated",
    range: "15,000+",
    maxVotes: null,
    color: "text-teal-300",
  },
];

function audienceTier(votes: number): AudienceTier {
  return (
    AUDIENCE_TIERS.find(
      (tier) => tier.maxVotes === null || votes <= tier.maxVotes,
    ) ?? AUDIENCE_TIERS[AUDIENCE_TIERS.length - 1]
  );
}

export function AudienceSignal({
  votes,
  onArtwork,
  showLabel,
}: {
  votes: number;
  onArtwork: boolean;
  showLabel: boolean;
}) {
  const tier = audienceTier(votes);
  const exactVotes = votes.toLocaleString();

  const signal = (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-normal leading-none",
        tier.color,
        showLabel &&
          "group cursor-help rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      title={showLabel ? undefined : `${tier.label} · ${exactVotes} TMDB votes`}
      tabIndex={showLabel ? 0 : undefined}
      aria-label={
        showLabel
          ? `${exactVotes} TMDB votes, ${tier.label}. Show audience ranges`
          : undefined
      }
    >
      <span
        className={cn(
          "mx-0.5 h-3 w-px",
          onArtwork ? "bg-white/25" : "bg-border",
        )}
        aria-hidden="true"
      />

      <SignalBars level={tier.level} />

      <span aria-label={`${exactVotes} TMDB votes, ${tier.label}`}>
        <span aria-hidden="true">{formatVotes(votes)}</span>
      </span>

      {showLabel && (
        <span
          className="ml-0.5 whitespace-nowrap decoration-dotted underline-offset-4 group-hover:underline"
          aria-hidden="true"
        >
          votes · {tier.label}
        </span>
      )}
    </span>
  );

  if (!showLabel) return signal;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{signal}</TooltipTrigger>
      <TooltipContent className="w-64 p-3" side="top">
        <p className="font-medium">Audience signal</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          WatchBridge tiers based on TMDB vote count.
        </p>
        <div className="mt-2 space-y-1">
          {AUDIENCE_TIERS.map((item) => (
            <div
              key={item.level}
              className={cn(
                "grid grid-cols-[1rem_1fr_auto] items-center gap-2 px-1.5 py-1",
                item.level === tier.level && "bg-secondary",
              )}
            >
              <span className={item.color}>
                <SignalBars level={item.level} />
              </span>
              <span className="text-[11px]">{item.label}</span>
              <span className="text-[10px] text-muted-foreground">
                {item.range}
              </span>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function SignalBars({ level }: { level: AudienceTier["level"] }) {
  return (
    <span className="inline-flex h-3 items-end gap-px" aria-hidden="true">
      {["h-[3px]", "h-[5px]", "h-[7px]", "h-[9px]"].map((height, index) => (
        <span
          key={height}
          className={cn(
            "w-0.5 bg-current",
            height,
            index < level ? "opacity-100" : "opacity-20",
          )}
        />
      ))}
    </span>
  );
}
