import { useCallback, useState } from "react";

/**
 * Briefly-true flag for swapping a copy icon to a tick. Every copy control in
 * the app wants the same acknowledgement, so the timer lives in one place.
 */
export function useCopiedFlag(duration = 1500): [boolean, () => void] {
  const [copied, setCopied] = useState(false);

  const flag = useCallback(() => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), duration);
  }, [duration]);

  return [copied, flag];
}
