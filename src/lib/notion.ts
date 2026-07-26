import { toast } from "@/stores/toast";
import { imdbUrl } from "@/lib/tmdb";
import { formatDate } from "@/lib/library";
import type { LibraryItem } from "@/types";

/**
 * Copy a formatted note to the clipboard and open Notion so it can be pasted.
 * A backend-free "log what I watched" flow — opens the user's configured
 * Notion page when set, otherwise a fresh Notion tab.
 */
export async function logToNotion(item: LibraryItem, notionUrl: string): Promise<void> {
  const stars = item.userRating
    ? `${"★".repeat(item.userRating)}${"☆".repeat(5 - item.userRating)} (${item.userRating}/5)`
    : "unrated";

  const note = [
    `${item.title}${item.year ? ` (${item.year})` : ""}`,
    `Rating: ${stars}`,
    item.watchedAt ? `Watched: ${formatDate(item.watchedAt)}` : "",
    item.imdbId ? `IMDb: ${imdbUrl(item.imdbId)}` : "",
    item.notes ? `\nNotes:\n${item.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await navigator.clipboard.writeText(note);
  } catch {
    // Clipboard may be unavailable; still open Notion below.
  }
  window.open(notionUrl || "https://www.notion.so/", "_blank", "noopener,noreferrer");
  toast("Note copied — paste into Notion", "success");
}
