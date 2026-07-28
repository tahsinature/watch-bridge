const STATE_PORT = "http://localhost:3000";
const DASHBOARD = "http://localhost:8080";
const CLIENT_ID = "paste-public-client-id";
const REDIRECT_URI = `${location.origin}/callback`;

function base64url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export async function connect() {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  sessionStorage.setItem("state-port-verifier", verifier);
  const authorize = new URL(DASHBOARD);
  authorize.searchParams.set("client_id", CLIENT_ID);
  authorize.searchParams.set("redirect_uri", REDIRECT_URI);
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("scope", "state:read state:write");
  authorize.searchParams.set("state", crypto.randomUUID()); // Validate this value on return in a real app.
  location.assign(authorize);
}

export async function finishCallback(code: string) {
  const tokens = await tokenRequest({
    grantType: "authorization_code", clientId: CLIENT_ID, redirectUri: REDIRECT_URI, code,
    codeVerifier: sessionStorage.getItem("state-port-verifier"),
  });
  localStorage.setItem("state-port-refresh-token", tokens.refreshToken);
  return tokens.accessToken;
}

export async function refresh() {
  const tokens = await tokenRequest({
    grantType: "refresh_token", clientId: CLIENT_ID,
    refreshToken: localStorage.getItem("state-port-refresh-token"),
  });
  // Rotation is mandatory: replace the saved refresh credential after every use.
  localStorage.setItem("state-port-refresh-token", tokens.refreshToken);
  return tokens.accessToken;
}

async function tokenRequest(body: object) {
  const response = await fetch(`${STATE_PORT}/v1/connect/token?client_id=${encodeURIComponent(CLIENT_ID)}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Reconnect to state-port");
  return response.json();
}

export async function readState(accessToken: string) {
  return fetch(`${STATE_PORT}/v1/state/${CLIENT_ID}`, {
    headers: { authorization: `Bearer ${accessToken}` },
  }).then((response) => response.json());
}

export async function writeState(accessToken: string, state: unknown, version: number) {
  const response = await fetch(`${STATE_PORT}/v1/state/${CLIENT_ID}`, {
    method: "PUT",
    headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ state, version }),
  });
  const result = await response.json();
  if (response.status === 409) {
    // Preserve the local `state`, stop automatic saving, and present exactly the
    // use-remote or force-overwrite choices. Never retry automatically.
    return { kind: "conflict" as const, localDraft: state, remote: result.current };
  }
  return { kind: "saved" as const, result };
}

export async function forceOverwrite(accessToken: string, preservedLocalDraft: unknown) {
  return fetch(`${STATE_PORT}/v1/state/${CLIENT_ID}/force`, {
    method: "PUT",
    headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ state: preservedLocalDraft }),
  }).then((response) => response.json());
}
