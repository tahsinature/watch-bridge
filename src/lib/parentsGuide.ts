/** Open IMDb's detailed content guide for a title. */
export function parentsGuideUrl(imdbId: string): string {
  return `https://www.imdb.com/title/${imdbId}/parentalguide`;
}
