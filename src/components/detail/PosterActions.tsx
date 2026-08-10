import { Check, Copy, Download, Link } from "lucide-react";
import { IconAction } from "@/components/ui/icon-action";
import { useCopiedFlag } from "@/hooks/useCopiedFlag";
import { posterUrl } from "@/lib/tmdb";
import {
  copyPosterImage,
  copyPosterUrl,
  downloadPoster,
} from "@/lib/titleActions";

interface PosterActionsProps {
  /** TMDB poster path; sizes are derived per action. */
  posterPath: string | null;
  title: string;
  year: string;
}

/**
 * Sits directly beneath the poster in the hero. Icon-only so the row stays
 * within the poster's width — the labels live in tooltips.
 */
export function PosterActions({ posterPath, title, year }: PosterActionsProps) {
  const [copied, flagCopied] = useCopiedFlag();
  const [downloaded, flagDownloaded] = useCopiedFlag();

  const fullUrl = posterUrl(posterPath, "original");
  // Clipboard writes must be PNG, so copy a mid-size render — encoding the
  // original losslessly produces a multi-hundred-megapixel blob.
  const clipboardUrl = posterUrl(posterPath, "w780");

  if (!fullUrl || !clipboardUrl) return null;

  async function handleCopy() {
    await copyPosterImage({ posterPath, title, year });
    flagCopied();
  }

  async function handleDownload() {
    await downloadPoster({ posterPath, title, year });
    flagDownloaded();
  }

  async function handleCopyUrl() {
    await copyPosterUrl({ posterPath, title, year });
  }

  return (
    <div className="flex justify-center gap-1">
      <IconAction label="Copy poster image" variant="secondary" onClick={handleCopy}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </IconAction>
      <IconAction label="Download poster" variant="secondary" onClick={handleDownload}>
        {downloaded ? (
          <Check className="size-4" />
        ) : (
          <Download className="size-4" />
        )}
      </IconAction>
      <IconAction label="Copy poster URL" variant="secondary" onClick={handleCopyUrl}>
        <Link className="size-4" />
      </IconAction>
    </div>
  );
}
