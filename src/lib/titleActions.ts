import { posterFilename, formatFileSize } from "@/lib/format";
import { copyImage, downloadImage } from "@/lib/poster";
import { posterUrl } from "@/lib/tmdb";
import { toast } from "@/stores/toast";

interface TitleTextContext {
  title: string;
  year: string;
}

interface PosterActionContext extends TitleTextContext {
  posterPath: string | null;
}

export async function copyTitle({ title }: TitleTextContext): Promise<void> {
  await navigator.clipboard.writeText(title);
  toast("Title copied", "success");
}

export async function copyTitleAndYear({
  title,
  year,
}: TitleTextContext): Promise<void> {
  const yearSuffix = year ? ` (${year})` : "";
  await navigator.clipboard.writeText(`${title}${yearSuffix}`);
  toast("Title and year copied", "success");
}

export async function copyPosterImage({
  posterPath,
  title,
}: PosterActionContext): Promise<void> {
  const fullUrl = posterUrl(posterPath, "original");
  const clipboardUrl = posterUrl(posterPath, "w780");
  if (!fullUrl || !clipboardUrl) return;

  const outcome = await copyImage(clipboardUrl, fullUrl);
  if (outcome.kind === "copied-image") {
    toast("Poster copied to clipboard", "success", {
      description: `PNG · ${outcome.width} × ${outcome.height} · ${formatFileSize(outcome.bytes)}`,
      image: { src: clipboardUrl, alt: `${title} poster` },
    });
    return;
  }

  toast("Poster URL copied", "success");
}

export async function downloadPoster({
  posterPath,
  title,
  year,
}: PosterActionContext): Promise<void> {
  const fullUrl = posterUrl(posterPath, "original");
  if (!fullUrl) return;

  const outcome = await downloadImage(fullUrl, posterFilename(title, year));
  toast(
    outcome === "downloaded"
      ? "Poster downloaded"
      : "Poster opened in a new tab",
    "success",
  );
}

export async function copyPosterUrl({
  posterPath,
}: PosterActionContext): Promise<void> {
  const fullUrl = posterUrl(posterPath, "original");
  if (!fullUrl) return;

  await navigator.clipboard.writeText(fullUrl);
  toast("Poster URL copied", "success");
}
