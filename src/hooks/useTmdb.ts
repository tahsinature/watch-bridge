import { useQuery } from "@tanstack/react-query";
import { getDetails, searchMulti } from "@/lib/tmdb";
import { useSettings } from "@/stores/settings";
import type { MediaType } from "@/types";

export function useSearch(query: string) {
  const apiKey = useSettings((s) => s.tmdbApiKey);
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["search", trimmed, apiKey],
    queryFn: () => searchMulti(apiKey, trimmed),
    enabled: apiKey.length > 0 && trimmed.length > 1,
  });
}

export function useDetails(
  mediaType: MediaType | undefined,
  id: number | undefined,
  enabled: boolean,
) {
  const apiKey = useSettings((s) => s.tmdbApiKey);

  return useQuery({
    queryKey: ["details", mediaType, id, apiKey],
    queryFn: () => getDetails(apiKey, mediaType!, id!),
    enabled: enabled && apiKey.length > 0 && !!mediaType && !!id,
  });
}
