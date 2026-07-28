# state-port MVP

A self-contained Bun/Hono + React/Vite mini-monorepo for storing one versioned JSON document per user-owned application. It uses ordinary PostgreSQL through Drizzle and can later move to Supabase Postgres by changing `DATABASE_URL`; it uses no Supabase API.

## Run

Requirements: Docker with Compose. From this directory:

```sh
docker compose up --build
```

Open `http://localhost:8080`; API health is `http://localhost:3000/health`. Copy `.env.example` when running processes outside Compose. The database migration is automatically applied only when the named volume is first created. For later migrations use a migration runner before API startup.

For host development, start Postgres (`docker compose up db`), then run `bun install`, `bun run dev:api`, and `bun run dev:web`. Use `bun run typecheck`, `bun run test`, and `bun run build`.

## Architecture and data

`apps/api` owns HTTP, authentication, Drizzle schema, and portable SQL. `apps/web` is a deliberately small dashboard. `users` own `applications`; each application has unconstrained `jsonb` state, an integer version, a public client ID, and exact registered redirect URLs. Dashboard `sessions` contain only SHA-256 hashes of random opaque bearer tokens. Passwords use Bun's password hashing.

Writes send `{ state, version }`. The API updates only when the stored version matches and returns `409 version_conflict` plus current data otherwise. After the version check, the server compares JSON structurally (object key order is irrelevant; array order remains significant). Semantically unchanged state performs no database update, does not change `updatedAt` or advance the version, and returns `{ "unchanged": true, "application": ... }`. A changed save returns the same envelope with `unchanged: false`. The dashboard also skips the request when it can identify unchanged state, but this is only an optimization—the server remains authoritative. Clients should compare state and debounce background saves to **no more than once per 10 seconds**; explicit Save may be immediate. The MVP dashboard intentionally uses manual Save only.

## API

- `POST /v1/auth/signup`, `POST /v1/auth/login`: `{email,password}` → `{token}`
- `GET/POST /v1/apps`: list or create `{name,state}`
- `PATCH /v1/apps/:id/client`: replace `{redirectUris}`
- `GET /v1/apps/:id/connections`, `DELETE /v1/apps/:id/connections/:tokenId`
- `GET /v1/apps/:id`
- `PUT /v1/apps/:id/state`: `{state,version}` → `{unchanged,application}`
- `PUT /v1/apps/:id/state/force`: explicit `{state}` overwrite → `{forced,unchanged,application}`
- `DELETE /v1/apps/:id`
- `POST /v1/connect/authorize`: signed-in approval and one-time code creation
- `POST /v1/connect/token?client_id=...`: authorization-code or refresh-token exchange
- `GET/PUT /v1/state/:clientId`: public-client state API protected by scoped access tokens
- `PUT /v1/state/:clientId/force`: explicit scoped force overwrite

Send `Authorization: Bearer TOKEN`. Example:

```sh
curl -X POST localhost:3000/v1/auth/signup -H 'content-type: application/json' -d '{"email":"dev@example.com","password":"development-only"}'
```

## Browser Connect lifecycle

The complete reference client is [examples/browser-client.ts](examples/browser-client.ts).

1. Register the frontend's **exact callback URL** in the dashboard and copy its public client ID. The ID identifies the application; it is not a secret.
2. Generate a high-entropy PKCE verifier in the frontend, keep it temporarily in `sessionStorage`, derive its RFC 7636 S256 challenge, and navigate to the state-port dashboard with `client_id`, exact `redirect_uri`, `code_challenge`, `scope`, and a CSRF `state` value.
3. The user signs in using the normal opaque dashboard session and explicitly allows the requested read/write scopes. state-port redirects to the exact registered URL with a five-minute, single-use code. The client must validate its `state`.
4. Exchange the code, verifier, client ID, and redirect URL at `/v1/connect/token?client_id=...`. The response contains a 15-minute app/user/scoped access token and an opaque rotating refresh credential.
5. Use the access token only with `/v1/state/:clientId`. `state:read` permits GET and `state:write` permits PUT. The path client ID must match the token's application.
6. When access expires (or on startup), exchange the saved refresh credential using `grantType: "refresh_token"` and **atomically replace it in client storage** with the returned credential. Refresh credentials rotate on every use. Reuse of a rotated credential revokes its token family and issued access tokens.

### Save conflicts

Normal state saves always require the version last read. A mismatch returns HTTP `409`:

```json
{ "error": "version_conflict", "current": { "state": {}, "version": 7, "updatedAt": "..." } }
```

The client contract is intentionally non-automatic: preserve the unsaved local draft, stop debounce/automatic saving for that document, and show exactly two choices:

1. **Use remote:** replace the local draft and version with `current`, then resume editing.
2. **Force overwrite:** send the preserved local draft to the separately named `/v1/state/:clientId/force` operation (or dashboard equivalent). The server writes it over whichever remote version is current and creates the next version.

Never automatically retry, overwrite, or generically merge a conflict. Force is an explicit user decision and does not weaken the ordinary version-checked endpoint. A forced document that is already semantically identical is still a no-op and does not advance its version. The reference client returns a discriminated `{kind:"conflict", localDraft, remote}` result suitable for a future SDK.

The refresh credential is the persistent per-device connection: a refresh months later normally obtains a new access token without user interaction. It has a 365-day absolute lifetime and a 180-day inactivity lifetime. Reconnection is required only after dashboard revocation, either expiry, refresh-token replay detection, or clearing client storage. No third-party cookies are used. A browser app must protect this bearer credential from XSS; localStorage is used in the example for persistence, which is a deliberate MVP security tradeoff. A production client may use a more isolated same-origin storage strategy.

Authorization redirect matching is exact, including scheme, host, port, path, and query. CORS for token/state endpoints is allowed only when the request `Origin` matches the origin of a registered redirect; token calls also carry the public client ID in the query so preflight can be evaluated. CORS is browser isolation, not client authentication. Opaque codes and tokens are stored only as SHA-256 hashes. Dashboard revocation invalidates the refresh family and current access tokens.

## Security limitations and deferred work

This is a development-safe foundation, **not a production-ready identity provider**. Add HTTPS, a secure first-party dashboard cookie/CSRF strategy (the dashboard demo uses localStorage bearer tokens), rate limiting, email verification/recovery, dashboard session revocation/cleanup, consent audit records, refresh-token device labels, secret management, request/body limits, and an operational migration runner before deployment. Public clients cannot keep secrets; PKCE limits authorization-code interception but cannot make a compromised browser safe. Access tokens are not JWTs and introspection is deliberately internal.

A `device_codes` table only reserves a possible future lifecycle. TV/console device-code pairing is **not implemented**; its safe polling, expiry, approval UX, and abuse controls remain deferred. The browser Connect flow described above requires the application to navigate a browser to the dashboard.

Encryption/zero knowledge, billing, teams, packaged SDKs, and real-time collaboration are intentionally deferred. API-key-like values are currently plain JSON in Postgres and must not be marketed as encrypted.

## Containers and extraction

Postgres uses `postgres:17-alpine`; API build/runtime use `oven/bun:1-alpine`; the static frontend runtime uses `nginx:1.27-alpine`. Multi-stage builds omit frontend build tooling and API dev dependencies from runtime. Alpine/musl keeps pulls small but can be incompatible with future native glibc-only packages; switch that service to Bun's Debian slim image if one is introduced.

To extract, move this directory unchanged, initialize its own repository, and keep its environment contract. It does not import or modify Watch Bridge. Before independent release, add CI, pin image digests/dependency versions, adopt a real migration command, and choose a production auth/pairing design.
