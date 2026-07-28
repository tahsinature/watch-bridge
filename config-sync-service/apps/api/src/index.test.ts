import { describe, expect, test } from "bun:test";
describe("service contract",()=>{test("Bun password hashing is available",async()=>expect(await Bun.password.verify("long-password",await Bun.password.hash("long-password"))).toBe(true))});
