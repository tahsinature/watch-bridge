import { Hono, type Context, type Next } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import {
  accessTokens, applications, authorizationCodes, db, refreshTokens, sessions, users,
} from "./db";
import {
  exactRedirectAllowed, hashToken, isValidPkceChallenge, originAllowed, pkceChallenge, randomToken,
} from "./security";

type Variables = { userId: string };
const app = new Hono<{ Variables: Variables }>();
const dashboardOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";
const accessLifetimeMs = 15 * 60_000;
const refreshLifetimeMs = 365 * 86_400_000;
const refreshInactivityMs = 180 * 86_400_000;
const allowedScopes = ["state:read", "state:write"] as const;

app.use("/v1/auth/*", cors({ origin: dashboardOrigin }));
app.use("/v1/apps/*", cors({ origin: dashboardOrigin }));
app.use("/v1/connect/authorize", cors({ origin: dashboardOrigin }));

const issueSession = async (userId: string) => {
  const token = randomToken();
  await db.insert(sessions).values({ tokenHash: hashToken(token), userId, expiresAt: new Date(Date.now() + 30 * 86_400_000) });
  return token;
};

const dashboardAuth = async (c: Context<{ Variables: Variables }>, next: Next) => {
  const token = c.req.header("authorization")?.replace(/^Bearer /, "");
  if (!token) return c.json({ error: "unauthorized" }, 401);
  const [session] = await db.select().from(sessions)
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date()))).limit(1);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  c.set("userId", session.userId);
  await next();
};

async function findClient(clientId: string) {
  const [client] = await db.select().from(applications).where(eq(applications.clientId, clientId)).limit(1);
  return client;
}

async function publicClientCors(c: Context, next: Next) {
  const origin = c.req.header("origin");
  const clientId = c.req.query("client_id") ?? c.req.param("clientId");
  if (origin && clientId) {
    const client = await findClient(clientId);
    if (!client || !originAllowed(client.redirectUris, origin)) return c.json({ error: "origin_not_allowed" }, 403);
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Vary", "Origin");
    c.header("Access-Control-Allow-Headers", "authorization, content-type");
    c.header("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
  }
  if (c.req.method === "OPTIONS") return c.body(null, 204);
  await next();
}
app.use("/v1/connect/token", publicClientCors);
app.use("/v1/state/:clientId", publicClientCors);
app.use("/v1/state/:clientId/force", publicClientCors);

const credentials = z.object({ email: z.string().email(), password: z.string().min(10).max(200) });
const redirectUris = z.array(z.string().url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol))).max(10);
const stateBody = z.object({ state: z.unknown(), version: z.number().int().positive() });

app.get("/health", (c) => c.json({ status: "ok" }));
app.post("/v1/auth/signup", zValidator("json", credentials), async (c) => {
  const body = c.req.valid("json");
  const id = randomUUID();
  try {
    await db.insert(users).values({ id, email: body.email.toLowerCase(), passwordHash: await Bun.password.hash(body.password) });
    return c.json({ token: await issueSession(id) }, 201);
  } catch {
    return c.json({ error: "email_already_exists" }, 409);
  }
});
app.post("/v1/auth/login", zValidator("json", credentials), async (c) => {
  const body = c.req.valid("json");
  const [user] = await db.select().from(users).where(eq(users.email, body.email.toLowerCase())).limit(1);
  if (!user || !await Bun.password.verify(body.password, user.passwordHash)) return c.json({ error: "invalid_credentials" }, 401);
  return c.json({ token: await issueSession(user.id) });
});

app.use("/v1/apps/*", dashboardAuth);
app.get("/v1/apps", async (c) => c.json(await db.select().from(applications).where(eq(applications.userId, c.get("userId")))));
app.post("/v1/apps", zValidator("json", z.object({ name: z.string().min(1).max(100), state: z.unknown().default({}), redirectUris: redirectUris.default([]) })), async (c) => {
  const [row] = await db.insert(applications).values({ id: randomUUID(), clientId: randomUUID(), userId: c.get("userId"), ...c.req.valid("json") }).returning();
  return c.json(row, 201);
});
app.patch("/v1/apps/:id/client", zValidator("json", z.object({ redirectUris })), async (c) => {
  const [row] = await db.update(applications).set({ redirectUris: c.req.valid("json").redirectUris })
    .where(and(eq(applications.id, c.req.param("id")), eq(applications.userId, c.get("userId")))).returning();
  return row ? c.json(row) : c.json({ error: "not_found" }, 404);
});
app.get("/v1/apps/:id/connections", async (c) => {
  const [owned] = await db.select().from(applications).where(and(eq(applications.id, c.req.param("id")), eq(applications.userId, c.get("userId"))));
  if (!owned) return c.json({ error: "not_found" }, 404);
  return c.json(await db.select({ id: refreshTokens.id, createdAt: refreshTokens.lastUsedAt, lastUsedAt: refreshTokens.lastUsedAt, expiresAt: refreshTokens.expiresAt, revokedAt: refreshTokens.revokedAt })
    .from(refreshTokens).where(eq(refreshTokens.applicationId, owned.id)));
});
app.delete("/v1/apps/:id/connections/:tokenId", async (c) => {
  const rows = await db.update(refreshTokens).set({ revokedAt: new Date() }).where(and(
    eq(refreshTokens.id, c.req.param("tokenId")), eq(refreshTokens.applicationId, c.req.param("id")),
    sql`EXISTS (SELECT 1 FROM applications a WHERE a.id = ${c.req.param("id")} AND a.user_id = ${c.get("userId")})`,
  )).returning({ familyId: refreshTokens.familyId });
  if (!rows.length) return c.json({ error: "not_found" }, 404);
  await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.familyId, rows[0].familyId));
  await db.update(accessTokens).set({ revokedAt: new Date() }).where(and(eq(accessTokens.applicationId, c.req.param("id")), eq(accessTokens.userId, c.get("userId"))));
  return c.body(null, 204);
});
app.get("/v1/apps/:id", async (c) => {
  const [row] = await db.select().from(applications).where(and(eq(applications.id, c.req.param("id")), eq(applications.userId, c.get("userId"))));
  return row ? c.json(row) : c.json({ error: "not_found" }, 404);
});
app.put("/v1/apps/:id/state", zValidator("json", stateBody), async (c) => saveState(c, c.req.param("id"), c.get("userId"), c.req.valid("json")));
app.put("/v1/apps/:id/state/force", zValidator("json", z.object({ state: z.unknown() })), async (c) =>
  forceState(c, c.req.param("id"), c.get("userId"), c.req.valid("json").state));
app.delete("/v1/apps/:id", async (c) => {
  const rows = await db.delete(applications).where(and(eq(applications.id, c.req.param("id")), eq(applications.userId, c.get("userId")))).returning({ id: applications.id });
  return rows.length ? c.body(null, 204) : c.json({ error: "not_found" }, 404);
});

app.post("/v1/connect/authorize", dashboardAuth, zValidator("json", z.object({
  clientId: z.string().uuid(), redirectUri: z.string().url(), codeChallenge: z.string(),
  scopes: z.array(z.enum(allowedScopes)).min(1), state: z.string().max(500).optional(),
})), async (c) => {
  const body = c.req.valid("json");
  if (!isValidPkceChallenge(body.codeChallenge)) return c.json({ error: "invalid_code_challenge" }, 400);
  const [client] = await db.select().from(applications).where(and(eq(applications.clientId, body.clientId), eq(applications.userId, c.get("userId"))));
  if (!client || !exactRedirectAllowed(client.redirectUris, body.redirectUri)) return c.json({ error: "invalid_client_or_redirect" }, 400);
  const code = randomToken();
  await db.insert(authorizationCodes).values({
    tokenHash: hashToken(code), applicationId: client.id, userId: c.get("userId"), redirectUri: body.redirectUri,
    codeChallenge: body.codeChallenge, scopes: [...new Set(body.scopes)].join(" "), expiresAt: new Date(Date.now() + 5 * 60_000),
  });
  const redirect = new URL(body.redirectUri);
  redirect.searchParams.set("code", code);
  if (body.state) redirect.searchParams.set("state", body.state);
  return c.json({ redirectTo: redirect.toString() });
});

const tokenRequest = z.discriminatedUnion("grantType", [
  z.object({ grantType: z.literal("authorization_code"), clientId: z.string().uuid(), redirectUri: z.string().url(), code: z.string(), codeVerifier: z.string().min(43).max(128) }),
  z.object({ grantType: z.literal("refresh_token"), clientId: z.string().uuid(), refreshToken: z.string() }),
]);
app.post("/v1/connect/token", zValidator("json", tokenRequest), async (c) => {
  const body = c.req.valid("json");
  if (body.clientId !== c.req.query("client_id")) return c.json({ error: "client_id_mismatch" }, 400);
  const client = await findClient(body.clientId);
  if (!client) return c.json({ error: "invalid_client" }, 400);
  if (body.grantType === "authorization_code") {
    const [code] = await db.update(authorizationCodes).set({ usedAt: new Date() }).where(and(
      eq(authorizationCodes.tokenHash, hashToken(body.code)), eq(authorizationCodes.applicationId, client.id),
      eq(authorizationCodes.redirectUri, body.redirectUri), eq(authorizationCodes.codeChallenge, pkceChallenge(body.codeVerifier)),
      gt(authorizationCodes.expiresAt, new Date()), isNull(authorizationCodes.usedAt),
    )).returning();
    if (!code) return c.json({ error: "invalid_grant" }, 400);
    return c.json((await issueConnectionTokens(client.id, code.userId, code.scopes)).response);
  }
  const now = new Date();
  const [old] = await db.update(refreshTokens).set({ revokedAt: now, lastUsedAt: now }).where(and(
    eq(refreshTokens.tokenHash, hashToken(body.refreshToken)), eq(refreshTokens.applicationId, client.id),
    gt(refreshTokens.expiresAt, now), gt(refreshTokens.lastUsedAt, new Date(Date.now() - refreshInactivityMs)), isNull(refreshTokens.revokedAt),
  )).returning();
  if (!old) {
    const [replayed] = await db.select().from(refreshTokens).where(and(
      eq(refreshTokens.tokenHash, hashToken(body.refreshToken)), eq(refreshTokens.applicationId, client.id),
    ));
    if (replayed?.revokedAt && replayed.replacedBy) {
      await db.update(refreshTokens).set({ revokedAt: now }).where(eq(refreshTokens.familyId, replayed.familyId));
      await db.update(accessTokens).set({ revokedAt: now }).where(and(eq(accessTokens.applicationId, client.id), eq(accessTokens.userId, replayed.userId)));
    }
    return c.json({ error: "invalid_grant" }, 400);
  }
  const result = await issueConnectionTokens(client.id, old.userId, old.scopes, old.familyId, old.expiresAt);
  await db.update(refreshTokens).set({ replacedBy: result.refreshTokenId }).where(eq(refreshTokens.id, old.id));
  return c.json(result.response);
});

app.get("/v1/state/:clientId", async (c) => {
  const auth = await authorizeAccess(c, "state:read");
  if (auth instanceof Response) return auth;
  const [state] = await db.select({ state: applications.state, version: applications.version, updatedAt: applications.updatedAt })
    .from(applications).where(and(eq(applications.id, auth.applicationId), eq(applications.userId, auth.userId)));
  return c.json(state);
});
app.put("/v1/state/:clientId", zValidator("json", stateBody), async (c) => {
  const auth = await authorizeAccess(c, "state:write");
  if (auth instanceof Response) return auth;
  return saveState(c, auth.applicationId, auth.userId, c.req.valid("json"));
});
app.put("/v1/state/:clientId/force", zValidator("json", z.object({ state: z.unknown() })), async (c) => {
  const auth = await authorizeAccess(c, "state:write");
  if (auth instanceof Response) return auth;
  return forceState(c, auth.applicationId, auth.userId, c.req.valid("json").state);
});

async function issueConnectionTokens(applicationId: string, userId: string, scopes: string, familyId: string = randomUUID(), familyExpiresAt = new Date(Date.now() + refreshLifetimeMs)) {
  const accessToken = randomToken();
  const refreshToken = randomToken();
  const refreshTokenId = randomUUID();
  await db.insert(accessTokens).values({ id: randomUUID(), tokenHash: hashToken(accessToken), applicationId, userId, scopes, expiresAt: new Date(Date.now() + accessLifetimeMs) });
  await db.insert(refreshTokens).values({ id: refreshTokenId, familyId, tokenHash: hashToken(refreshToken), applicationId, userId, scopes, expiresAt: familyExpiresAt });
  return {
    refreshTokenId,
    response: { accessToken, tokenType: "Bearer", expiresIn: accessLifetimeMs / 1000, refreshToken, refreshExpiresAt: familyExpiresAt.toISOString(), scope: scopes },
    accessToken, tokenType: "Bearer", expiresIn: accessLifetimeMs / 1000, refreshToken, refreshExpiresAt: familyExpiresAt.toISOString(), scope: scopes,
  };
}

async function authorizeAccess(c: Context, requiredScope: string) {
  const token = c.req.header("authorization")?.replace(/^Bearer /, "");
  if (!token) return c.json({ error: "invalid_token" }, 401);
  const [record] = await db.select().from(accessTokens).where(and(
    eq(accessTokens.tokenHash, hashToken(token)), gt(accessTokens.expiresAt, new Date()), isNull(accessTokens.revokedAt),
  ));
  if (!record) return c.json({ error: "invalid_token" }, 401);
  const client = await findClient(c.req.param("clientId") ?? "");
  if (!client || record.applicationId !== client.id) return c.json({ error: "invalid_token" }, 401);
  if (!record.scopes.split(" ").includes(requiredScope)) return c.json({ error: "insufficient_scope" }, 403);
  return record;
}

async function saveState(c: Context, applicationId: string, userId: string, body: z.infer<typeof stateBody>) {
  const [row] = await db.update(applications).set({ state: body.state, version: body.version + 1, updatedAt: new Date() }).where(and(
    eq(applications.id, applicationId), eq(applications.userId, userId), eq(applications.version, body.version),
    sql`${applications.state} IS DISTINCT FROM ${JSON.stringify(body.state)}::jsonb`,
  )).returning();
  if (row) return c.json({ unchanged: false, application: row });
  const [current] = await db.select().from(applications).where(and(eq(applications.id, applicationId), eq(applications.userId, userId)));
  if (!current) return c.json({ error: "not_found" }, 404);
  return current.version === body.version ? c.json({ unchanged: true, application: current }) : c.json({ error: "version_conflict", current }, 409);
}

async function forceState(c: Context, applicationId: string, userId: string, state: unknown) {
  const [row] = await db.update(applications).set({
    state, version: sql`${applications.version} + 1`, updatedAt: new Date(),
  }).where(and(
    eq(applications.id, applicationId), eq(applications.userId, userId),
    sql`${applications.state} IS DISTINCT FROM ${JSON.stringify(state)}::jsonb`,
  )).returning();
  if (row) return c.json({ unchanged: false, forced: true, application: row });
  const [current] = await db.select().from(applications).where(and(eq(applications.id, applicationId), eq(applications.userId, userId)));
  return current ? c.json({ unchanged: true, forced: true, application: current }) : c.json({ error: "not_found" }, 404);
}

app.onError((error, c) => {
  console.error(error);
  return c.json({ error: "internal_error" }, 500);
});
export default { port: Number(process.env.PORT ?? 3000), fetch: app.fetch };
