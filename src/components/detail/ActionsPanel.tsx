import { LabeledBlock, LabeledRow } from "./LabeledRow";
import { PosterActions } from "./PosterActions";
import { ActionBar } from "@/components/actions/ActionBar";
import type { TitleDetails } from "@/types";

/**
 * External actions for a title. Shortlist and Watched deliberately live in the
 * pinned DetailActionBar rather than here — they're the primary actions and
 * shouldn't sit below two sections of metadata.
 */
export function ActionsPanel({ details }: { details: TitleDetails }) {
  return (
    <LabeledBlock>
      <ActionBar details={details} />

      <LabeledRow label="Poster">
        <PosterActions
          posterPath={details.posterPath}
          title={details.title}
          year={details.year}
        />
      </LabeledRow>
    </LabeledBlock>
  );
}
