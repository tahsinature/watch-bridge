import { describe, expect, test } from "bun:test";
import {
  findFuzzyCandidatesInEntries,
  searchSimilarity,
  type SearchIndexEntry,
} from "../src/lib/fuzzySearch";

describe("fuzzy search", () => {
  test("tolerates misspellings and reversed word order", () => {
    expect(searchSimilarity("Leam Ne", "Liam Neeson")).toBeGreaterThan(0.6);
    expect(searchSimilarity("Incepton", "Inception")).toBeGreaterThan(0.8);
    expect(searchSimilarity("Neeson Liam", "Liam Neeson")).toBe(1);
  });

  test("finds expected people and titles in the generated TMDB index", async () => {
    const document = (await Bun.file("public/search-index.json").json()) as {
      entries: SearchIndexEntry[];
    };

    const personMatches = findFuzzyCandidatesInEntries(
      document.entries,
      "Leam Ne",
    );
    const titleMatches = findFuzzyCandidatesInEntries(
      document.entries,
      "Incepton",
    );

    expect(personMatches.people.map((match) => match.name)).toContain(
      "Liam Neeson",
    );
    expect(personMatches.titles).toEqual([]);
    expect(titleMatches.titles.map((match) => match.name)).toContain(
      "Inception",
    );
    expect(titleMatches.people).toEqual([]);
  });
});
