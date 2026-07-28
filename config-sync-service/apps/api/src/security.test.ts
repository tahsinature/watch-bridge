import { describe, expect, test } from "bun:test";
import { exactRedirectAllowed, originAllowed, pkceChallenge } from "./security";

describe("browser connect security", () => {
  test("creates the RFC 7636 S256 challenge", () => {
    expect(pkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"))
      .toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });
  test("requires an exact redirect but allows its registered origin for CORS", () => {
    const registered = ["https://client.example/callback"];
    expect(exactRedirectAllowed(registered, "https://client.example/callback")).toBe(true);
    expect(exactRedirectAllowed(registered, "https://client.example/other")).toBe(false);
    expect(originAllowed(registered, "https://client.example")).toBe(true);
  });
});
