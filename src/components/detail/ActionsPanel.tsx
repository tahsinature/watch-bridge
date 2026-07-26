import { LabeledBlock, LabeledRow } from "./LabeledRow";
import { LibraryActions } from "./LibraryActions";
import { PosterActions } from "./PosterActions";
import { ActionBar } from "@/components/actions/ActionBar";
import type { TitleDetails } from "@/types";

/** Every action for a title, grouped into labeled rows. */
export function ActionsPanel({ details }: { details: TitleDetails }) {
  return (
    <LabeledBlock>
      {/* Hidden on phones — these live in the sheet's sticky bar there. */}
      <LabeledRow label="Library" className="hidden sm:grid">
        <LibraryActions details={details} />
      </LabeledRow>

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
