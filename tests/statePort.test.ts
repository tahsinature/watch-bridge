import { describe, expect, test } from "bun:test";
import { statePortRedirectUri } from "../src/lib/statePort";

describe("State Port browser callback", () => {
  test("uses the exact origin and pathname without transient query state", () => {
    expect(statePortRedirectUri({ origin: "http://localhost:5173", pathname: "/" } as Location))
      .toBe("http://localhost:5173/");
  });
});
