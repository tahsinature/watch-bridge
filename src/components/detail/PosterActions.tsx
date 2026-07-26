import { useState } from "react";
import { Check, Copy, Download, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyImage, downloadImage } from "@/lib/poster";
import { posterFilename } from "@/lib/format";
import { posterUrl } from "@/lib/tmdb";
import { toast } from "@/stores/toast";

interface PosterActionsProps {
  /** TMDB poster path; sizes are derived per action. */
  posterPath: string | null;
  title: string;
  year: string;
}

export function PosterActions({ posterPath, title, year }: PosterActionsProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const fullUrl = posterUrl(posterPath, "original");
  // Clipboard writes must be PNG, so copy a mid-size render — encoding the
  // original losslessly produces a multi-hundred-megapixel blob.
  const clipboardUrl = posterUrl(posterPath, "w780");

  if (!fullUrl || !clipboardUrl) return null;

  async function handleCopy() {
    const outcome = await copyImage(clipboardUrl!, fullUrl!);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
    toast(
      outcome === "copied-image" ? "Poster copied to clipboard" : "Poster URL copied",
      "success",
    );
  }

  async function handleDownload() {
    const outcome = await downloadImage(fullUrl!, posterFilename(title, year));
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 1500);
    toast(
      outcome === "downloaded" ? "Poster downloaded" : "Poster opened in a new tab",
      "success",
    );
  }

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(fullUrl!);
    toast("Poster URL copied", "success");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" onClick={handleCopy}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        Copy image
      </Button>
      <Button variant="secondary" size="sm" onClick={handleDownload}>
        {downloaded ? <Check className="size-4" /> : <Download className="size-4" />}
        Download
      </Button>
      <Button variant="secondary" size="sm" onClick={handleCopyUrl}>
        <Link className="size-4" />
        Copy URL
      </Button>
    </div>
  );
}
