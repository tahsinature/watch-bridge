import { afterEach, describe, expect, test } from "bun:test";
import {
  getPerson,
  searchMulti,
  searchWithFuzzyFallback,
} from "../src/lib/tmdb";

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow) {
    globalThis.window = originalWindow;
  } else {
    delete (globalThis as { window?: Window }).window;
  }
});

function mockTmdbResponse(body: unknown) {
  globalThis.fetch = (() =>
    Promise.resolve(Response.json(body))) as typeof fetch;
}

describe("TMDB people search", () => {
  test("returns supported people alongside titles from one multi-search", async () => {
    mockTmdbResponse({
      results: [
        {
          id: 10,
          media_type: "movie",
          title: "Example Film",
          release_date: "2024-05-01",
        },
        {
          id: 20,
          media_type: "person",
          name: "Example Producer",
          known_for_department: "Production",
          profile_path: "/producer.jpg",
          known_for: [
            {
              id: 10,
              media_type: "movie",
              title: "Example Film",
              release_date: "2024-05-01",
            },
          ],
        },
        {
          id: 30,
          media_type: "person",
          name: "Unsupported Crew Member",
          known_for_department: "Costume & Make-Up",
        },
      ],
    });

    const results = await searchMulti("api-key", "example");

    expect(results.titles.map((title) => title.title)).toEqual([
      "Example Film",
    ]);
    expect(results.people).toHaveLength(1);
    expect(results.people[0]).toMatchObject({
      id: 20,
      name: "Example Producer",
      creditMode: "production",
      knownForDepartment: "Production",
    });
    expect(results.people[0].knownFor[0].title).toBe("Example Film");
  });

  test("separates producer credits from directing and acting", async () => {
    mockTmdbResponse({
      id: 20,
      name: "Example Producer",
      known_for_department: "Production",
      combined_credits: {
        cast: [
          {
            id: 40,
            media_type: "movie",
            title: "Acted Film",
            vote_count: 20,
          },
        ],
        crew: [
          {
            id: 41,
            media_type: "movie",
            title: "Produced Film",
            job: "Producer",
            vote_count: 50,
          },
          {
            id: 42,
            media_type: "tv",
            name: "Executive Produced Series",
            job: "Executive Producer",
            vote_count: 100,
          },
          {
            id: 43,
            media_type: "movie",
            title: "Directed Film",
            job: "Director",
            vote_count: 30,
          },
        ],
      },
    });

    const person = await getPerson("api-key", 20);

    expect(person.actingCredits.map((title) => title.title)).toEqual([
      "Acted Film",
    ]);
    expect(person.creativeCredits.map((title) => title.title)).toEqual([
      "Directed Film",
    ]);
    expect(person.productionCredits.map((title) => title.title)).toEqual([
      "Executive Produced Series",
      "Produced Film",
    ]);
  });

  test("hydrates a fuzzy person candidate when exact search is weak", async () => {
    globalThis.window = {
      location: { href: "http://localhost:5173/" },
    } as Window & typeof globalThis;
    globalThis.fetch = ((input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("search-index.json")) {
        return Promise.resolve(
          Response.json({
            version: 1,
            sourceDate: "2026-08-21",
            entries: [["p", 3896, "Liam Neeson", 50]],
          }),
        );
      }
      if (url.includes("/search/multi")) {
        return Promise.resolve(Response.json({ results: [] }));
      }
      if (url.includes("/person/3896")) {
        return Promise.resolve(
          Response.json({
            id: 3896,
            name: "Liam Neeson",
            known_for_department: "Acting",
            profile_path: "/liam.jpg",
          }),
        );
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    }) as typeof fetch;

    const results = await searchWithFuzzyFallback("api-key", "Leam Ne");

    expect(results.usedFuzzyFallback).toBe(true);
    expect(results.people[0]).toMatchObject({
      id: 3896,
      name: "Liam Neeson",
      creditMode: "acting",
    });
  });
});
