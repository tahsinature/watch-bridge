import { useContentLevel } from "@/stores/content";
import { useSettings } from "@/stores/settings";
import type { MediaType } from "@/types";

/**
 * Whether a title sits above the configured content limit, with the bits of
 * presentation that go with it. An unrated title is never dimmed — "unknown"
 * isn't the same as "too much".
 */
export function useContentLimit(id: number, mediaType: MediaType) {
  const level = useContentLevel(id, mediaType);
  const maxLevel = useSettings((s) => s.maxContentLevel);
  const overLimit = maxLevel !== null && level !== undefined && level > maxLevel;

  return {
    overLimit,
    /** Explains the dimming on hover; undefined when within limits. */
    tooltip: overLimit ? "Above your content limit" : undefined,
    /** Fades the card, restoring it on hover so it stays readable. */
    dimClass: overLimit ? "opacity-35 hover:opacity-100" : "",
  };
}
