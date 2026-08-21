import { describe, expect, test } from "bun:test";
import {
  isUpcomingRelease,
  sortFilmographyResults,
  type FilmographySortOrder,
} from "../src/lib/sort";
import type { SearchResult } from "../src/types";

const TODAY = "2026-08-21";

function credit(
  title: string,
  releaseDate: string,
  voteCount = 0,
): SearchResult {
  return {
    id: title.length,
    mediaType: "movie",
    title,
    year: releaseDate.slice(0, 4),
    releaseDate,
    overview: "",
    posterPath: null,
    backdropPath: null,
    voteAverage: 0,
    voteCount,
    adult: false,
  };
}

describe("filmography sorting", () => {
  test("shows the nearest upcoming work before released work newest-first", () => {
    const credits = [
      credit("Older", "2020-01-01"),
      credit("Far future", "2027-05-01"),
      credit("Recent", "2026-08-01"),
      credit("Coming soon", "2026-09-01"),
      credit("Undated", ""),
    ];

    expect(
      sortFilmographyResults(credits, "newest", TODAY).map(
        (result) => result.title,
      ),
    ).toEqual([
      "Coming soon",
      "Far future",
      "Recent",
      "Older",
      "Undated",
    ]);
    expect(credits[0].title).toBe("Older");
  });

  test("keeps existing filmography orders available", () => {
    const credits = [
      credit("Less popular", "2026-01-01", 10),
      credit("More popular", "2020-01-01", 500),
    ];

    const order: FilmographySortOrder = "votes";
    expect(sortFilmographyResults(credits, order, TODAY)[0].title).toBe(
      "More popular",
    );
  });

  test("only treats known future dates as upcoming", () => {
    expect(isUpcomingRelease("2026-08-22", TODAY)).toBe(true);
    expect(isUpcomingRelease("2026-08-21", TODAY)).toBe(false);
    expect(isUpcomingRelease("", TODAY)).toBe(false);
  });
});
