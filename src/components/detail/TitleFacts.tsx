import { Badge } from "@/components/ui/badge";
import { RatingBadge } from "@/components/ui/rating-badge";
import { CopyTextButton } from "@/components/ui/copy-text-button";
import { LabeledBlock, LabeledRow } from "./LabeledRow";
import { ContentLevelPicker } from "./ContentLevelPicker";
import { useSettings } from "@/stores/settings";
import { formatRating, formatReleaseSpan, formatRuntime } from "@/lib/format";
import type { TitleDetails } from "@/types";

/** Key facts as labeled rows — scannable and comparable across titles. */
export function TitleFacts({ details }: { details: TitleDetails }) {
  const rating = formatRating(details.voteAverage);
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

      {rating && (
        <LabeledRow label="Rating">
          <RatingBadge
            average={details.voteAverage}
            votes={details.voteCount}
            variant="detail"
          />
        </LabeledRow>
      )}

      {certification && (
        <LabeledRow label="Cert">
          <span className="flex items-center gap-2 text-sm">
            <Badge variant="outline">{certification}</Badge>
            <span className="text-muted-foreground">{certCountry}</span>
          </span>
        </LabeledRow>
      )}

      <LabeledRow label="Nudity">
        <ContentLevelPicker details={details} />
      </LabeledRow>

      {details.directors.length > 0 && (
        <LabeledRow label={creditLabel}>
          <span className="text-sm">{details.directors.join(" · ")}</span>
        </LabeledRow>
      )}

      {details.overview && (
        <LabeledRow label="Overview">
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm leading-relaxed text-foreground/80">
              {details.overview}
            </p>
            <CopyTextButton
              value={details.overview}
              label="Copy overview"
              toastMessage="Overview copied"
            />
          </div>
        </LabeledRow>
      )}
    </LabeledBlock>
  );
}

/** Ongoing series read as positive; cancelled reads as a warning. */
function statusVariant(status: string): "cyan" | "outline" | "gold" {
  if (status === "Returning Series" || status === "In Production") return "cyan";
  if (status === "Canceled") return "gold";
  return "outline";
}
