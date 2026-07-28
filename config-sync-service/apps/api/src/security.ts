import { createHash, randomBytes } from "node:crypto";

export const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");
export const randomToken = () => randomBytes(32).toString("base64url");
export const pkceChallenge = (verifier: string) => createHash("sha256").update(verifier).digest("base64url");
export const isValidPkceChallenge = (value: string) => /^[A-Za-z0-9_-]{43}$/.test(value);
export const exactRedirectAllowed = (registered: string[], requested: string) =>
  registered.includes(requested) && ["http:", "https:"].includes(new URL(requested).protocol);
export const originAllowed = (registered: string[], origin: string) =>
  registered.some((uri) => new URL(uri).origin === origin);
