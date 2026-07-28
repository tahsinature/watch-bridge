import { ExternalLink, Shield } from "lucide-react";
import { AdultBadge } from "@/components/ui/adult-badge";
import { Badge } from "@/components/ui/badge";
import { CopyTextButton } from "@/components/ui/copy-text-button";
import { LabeledBlock, LabeledRow } from "./LabeledRow";
import { useSettings } from "@/stores/settings";
import { formatReleaseSpan, formatRuntime } from "@/lib/format";
import { parentsGuideUrl } from "@/lib/parentsGuide";
import type { TitleDetails } from "@/types";

/** Key facts as labeled rows — scannable and comparable across titles. */
export function TitleFacts({ details }: { details: TitleDetails }) {
  const runtime = formatRuntime(details.runtime);
  const isSeries = details.mediaType === "tv";
  const languages = details.spokenLanguages.length
    ? details.spokenLanguages
    : [details.originalLanguage.toUpperCase()].filter(Boolean);
  const creditLabel = isSeries ? "Creator" : "Director";

  // Prefer a certification from a country the user actually watches in.
  const regions = useSettings((s) => s.regions);
  const certCountry = [...regions, "US"].find((c) => details.certifications[c]);
  const certification = certCountry ? details.certifications[certCountry] : null;

  return (
    <LabeledBlock>
      {details.overview && (
        <LabeledRow label="Description">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground/80">
              {details.overview}
            </p>
            <CopyTextButton
              value={details.overview}
              label="Copy description"
              toastMessage="Description copied"
            />
          </div>
        </LabeledRow>
      )}

      <LabeledRow label="Release">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm">{formatReleaseSpan(details)}</span>
          {details.status && (
            <Badge variant={statusVariant(details.status)}>{details.status}</Badge>
          )}
        </div>
      </LabeledRow>

      {isSeries && details.numberOfSeasons != null && (
        <LabeledRow label="Seasons">
          <span className="text-sm">
            {details.numberOfSeasons} season
            {details.numberOfSeasons === 1 ? "" : "s"}
            {details.numberOfEpisodes != null &&
              ` · ${details.numberOfEpisodes} episodes`}
          </span>
        </LabeledRow>
      )}

      {runtime && (
        <LabeledRow label="Runtime">
          <span className="text-sm">
            {runtime}
            {isSeries ? " per episode" : ""}
          </span>
        </LabeledRow>
      )}

      {languages.length > 0 && (
        <LabeledRow label="Language">
          <span className="text-sm">{languages.join(" · ")}</span>
        </LabeledRow>
      )}

      {details.genres.length > 0 && (
        <LabeledRow label="Genres">
          <span className="text-sm">{details.genres.join(" · ")}</span>
        </LabeledRow>
      )}

      {certification && (
        <LabeledRow label="Age rating">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <Badge variant="gold">
              <Shield aria-hidden="true" />
              {certification}
            </Badge>
            <span className="text-muted-foreground">{certCountry}</span>
            {details.imdbId && (
              <span className="inline-flex items-center gap-3">
                <span
                  className="h-4 w-px bg-border"
                  aria-hidden="true"
                />
                <ParentsGuideLink imdbId={details.imdbId} />
              </span>
            )}
          </span>
        </LabeledRow>
      )}

      {(details.adult || (!certification && details.imdbId)) && (
        <LabeledRow label="Content">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
            <AdultBadge adult={details.adult} />
            {!certification && details.imdbId && (
              <ParentsGuideLink imdbId={details.imdbId} />
            )}
          </div>
        </LabeledRow>
      )}

      {details.directors.length > 0 && (
        <LabeledRow label={creditLabel}>
          <span className="text-sm">{details.directors.join(" · ")}</span>
        </LabeledRow>
      )}

    </LabeledBlock>
  );
}

function ParentsGuideLink({ imdbId }: { imdbId: string }) {
  return (
    <a
      href={parentsGuideUrl(imdbId)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80 hover:underline"
    >
      Check IMDb Parents Guide
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

/** Ongoing series read as positive; cancelled reads as a warning. */
function statusVariant(status: string): "cyan" | "outline" | "gold" {
  if (status === "Returning Series" || status === "In Production") return "cyan";
  if (status === "Canceled") return "gold";
  return "outline";
}
