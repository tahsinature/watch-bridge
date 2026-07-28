import { describe, expect, test } from "bun:test";
import { jsonValuesEqual } from "./json";

describe("jsonValuesEqual", () => {
  test("ignores object key order", () => {
    expect(jsonValuesEqual({ enabled: true, nested: { count: 2 } }, { nested: { count: 2 }, enabled: true })).toBe(true);
  });
  test("preserves array order and detects changes", () => {
    expect(jsonValuesEqual({ values: [1, 2] }, { values: [2, 1] })).toBe(false);
    expect(jsonValuesEqual(null, {})).toBe(false);
  });
});
