import { useQueries, useQuery } from "@tanstack/react-query";
import {
  discoverByGenre,
  getDetails,
  getGenres,
  getPerson,
  getSimilarTitles,
  getTrendingTitles,
  searchMulti,
} from "@/lib/tmdb";
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

export function useTrendingTitles(enabled = true) {
  const apiKey = useSettings((s) => s.tmdbApiKey);

  return useQuery({
    queryKey: ["trending", "week", apiKey],
    queryFn: () => getTrendingTitles(apiKey),
    enabled: enabled && apiKey.length > 0,
  });
}

export function useGenres(
  mediaType: MediaType | undefined,
  enabled: boolean,
) {
  const apiKey = useSettings((s) => s.tmdbApiKey);

  return useQuery({
    queryKey: ["genres", mediaType, apiKey],
    queryFn: () => getGenres(apiKey, mediaType!),
    enabled: enabled && apiKey.length > 0 && !!mediaType,
  });
}

export function useGenreTitles(
  mediaType: MediaType | undefined,
  genreId: number | undefined,
  enabled: boolean,
) {
  const apiKey = useSettings((s) => s.tmdbApiKey);
  const minimumVotes = useSettings((s) => s.minimumVotes);

  return useQuery({
    queryKey: ["discover", mediaType, genreId, minimumVotes, apiKey],
    queryFn: () =>
      discoverByGenre(apiKey, mediaType!, genreId!, minimumVotes),
    enabled:
      enabled &&
      apiKey.length > 0 &&
      !!mediaType &&
      genreId !== undefined,
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

export function useSimilarTitles(
  mediaType: MediaType,
  id: number,
  enabled: boolean,
) {
  const apiKey = useSettings((s) => s.tmdbApiKey);

  return useQuery({
    queryKey: ["similar", mediaType, id, apiKey],
    queryFn: () => getSimilarTitles(apiKey, mediaType, id),
    enabled: enabled && apiKey.length > 0,
  });
}

export function usePerson(id: number | undefined, enabled: boolean) {
  const apiKey = useSettings((s) => s.tmdbApiKey);

  return useQuery({
    queryKey: ["person", id, apiKey],
    queryFn: () => getPerson(apiKey, id!),
    enabled: enabled && apiKey.length > 0 && !!id,
  });
}

/** Fetch several people in parallel while sharing `usePerson` cache entries. */
export function usePeople(ids: number[], enabled: boolean) {
  const apiKey = useSettings((s) => s.tmdbApiKey);

  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ["person", id, apiKey],
      queryFn: () => getPerson(apiKey, id),
      enabled: enabled && apiKey.length > 0,
    })),
  });
}
