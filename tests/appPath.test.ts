import { describe, expect, test } from "bun:test";
import { deriveAppBasePath, matchesAppPath } from "../src/lib/appPath";

describe("application path", () => {
  test("uses the root path in development", () => {
    expect(deriveAppBasePath("http://localhost:5173/src/main.tsx", true)).toBe(
      "/",
    );
  });

  test("derives a portable production mount path from the entry asset", () => {
    expect(
      deriveAppBasePath(
        "https://example.github.io/watch-bridge/assets/index-abc123.js",
        false,
      ),
    ).toBe("/watch-bridge/");
  });

  test("accepts only the app root and its index file", () => {
    expect(matchesAppPath("/watch-bridge/", "/watch-bridge/")).toBe(true);
    expect(matchesAppPath("/watch-bridge", "/watch-bridge/")).toBe(true);
    expect(matchesAppPath("/watch-bridge/index.html", "/watch-bridge/")).toBe(
      true,
    );
    expect(matchesAppPath("/watch-bridge/debugafs", "/watch-bridge/")).toBe(
      false,
    );
  });
});
