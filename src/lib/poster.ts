/**
 * Poster copy/download helpers. TMDB's image CDN usually allows cross-origin
 * reads, but we degrade gracefully when it doesn't: copy falls back to copying
 * the image URL, and download falls back to opening the image in a new tab.
 */

export type DownloadOutcome = "downloaded" | "opened";
export type CopyOutcome = "copied-image" | "copied-url";

/**
 * Browsers only accept `image/png` for clipboard image writes, and PNG is
 * lossless — re-encoding a full-resolution poster produces a huge blob (a 2 MB
 * JPEG becomes ~13 MB). Callers pass a mid-size source, and we additionally cap
 * the long edge so an oversized image can't blow up the clipboard.
 */
const CLIPBOARD_MAX_EDGE = 1200;

export async function downloadImage(
  url: string,
  filename: string,
): Promise<DownloadOutcome> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
    return "downloaded";
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
    return "opened";
  }
}

/**
 * @param url        Image to place on the clipboard (use a mid-size render).
 * @param fallbackUrl URL copied as text when image copy isn't possible.
 */
export async function copyImage(
  url: string,
  fallbackUrl: string = url,
): Promise<CopyOutcome> {
  try {
    const clipboard = navigator.clipboard;
    if (!clipboard || !("write" in clipboard) || typeof ClipboardItem === "undefined") {
      throw new Error("clipboard image write unsupported");
    }
    const pngBlob = await urlToPngBlob(url);
    await clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
    return "copied-image";
  } catch {
    await navigator.clipboard.writeText(fallbackUrl);
    return "copied-url";
  }
}

async function urlToPngBlob(url: string): Promise<Blob> {
  const img = await loadImage(url);
  const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
  const scale = Math.min(1, CLIPBOARD_MAX_EDGE / longEdge);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/png",
    );
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = url;
  });
}
