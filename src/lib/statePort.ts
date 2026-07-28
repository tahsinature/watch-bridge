import { buildBackup, restoreBackup, type BackupFile, type RestoreSummary } from "@/lib/backup";

const apiUrl = import.meta.env.VITE_STATE_PORT_API_URL ?? "http://localhost:3000";
const dashboardUrl = import.meta.env.VITE_STATE_PORT_DASHBOARD_URL ?? "http://localhost:8080";
const connectionKey = "watchbridge.state-port.connection";
const pendingKey = "watchbridge.state-port.pending";

interface Connection {
  clientId: string;
  refreshToken: string;
  refreshExpiresAt: string;
  version: number;
}

interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresAt: string;
}

interface RemoteState {
  state: unknown;
  version: number;
  updatedAt: string;
}

export type SaveResult =
  | { kind: "saved"; unchanged: boolean; version: number }
  | { kind: "conflict"; localDraft: BackupFile; remote: RemoteState };

let access: { token: string; expiresAt: number } | null = null;
let refreshInFlight: Promise<string> | null = null;
let callbackInFlight: Promise<boolean> | null = null;

export function statePortRedirectUri(locationLike: Pick<Location, "origin" | "pathname"> = location) {
  return `${locationLike.origin}${locationLike.pathname}`;
}

export function getStatePortConnection() {
  const raw = localStorage.getItem(connectionKey);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Connection;
    return typeof parsed.clientId === "string" && typeof parsed.refreshToken === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export async function beginStatePortConnect(clientId: string) {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  const state = crypto.randomUUID();
  const redirectUri = statePortRedirectUri();
  sessionStorage.setItem(pendingKey, JSON.stringify({ clientId, verifier, state, redirectUri }));
  const authorize = new URL(dashboardUrl);
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("scope", "state:read state:write");
  authorize.searchParams.set("state", state);
  location.assign(authorize);
}

export function finishStatePortCallback(): Promise<boolean> {
  if (callbackInFlight) return Promise.resolve(false);
  callbackInFlight = finishCallbackOnce();
  return callbackInFlight;
}

async function finishCallbackOnce(): Promise<boolean> {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const returnedState = params.get("state");
  if (!code) return false;
  const rawPending = sessionStorage.getItem(pendingKey);
  if (!rawPending) throw new Error("State Port connection session was lost. Connect again.");
  const pending = JSON.parse(rawPending) as { clientId: string; verifier: string; state: string; redirectUri: string };
  if (!returnedState || returnedState !== pending.state) throw new Error("State Port connection validation failed.");
  const tokens = await requestTokens(pending.clientId, {
    grantType: "authorization_code", clientId: pending.clientId, redirectUri: pending.redirectUri,
    code, codeVerifier: pending.verifier,
  });
  access = { token: tokens.accessToken, expiresAt: Date.now() + tokens.expiresIn * 1000 };
  const remote = await readWithAccess(pending.clientId, tokens.accessToken);
  saveConnection({ clientId: pending.clientId, refreshToken: tokens.refreshToken, refreshExpiresAt: tokens.refreshExpiresAt, version: remote.version });
  sessionStorage.removeItem(pendingKey);
  history.replaceState(null, "", `${location.pathname}${location.hash}`);
  return true;
}

export async function loadStatePortRemote(): Promise<RestoreSummary> {
  const connection = requireConnection();
  const remote = await readWithAccess(connection.clientId, await accessToken());
  const summary = restoreBackup(remote.state);
  saveConnection({ ...connection, version: remote.version });
  return summary;
}

export async function saveStatePortLocal(): Promise<SaveResult> {
  const connection = requireConnection();
  const localDraft = buildBackup();
  const response = await fetch(`${apiUrl}/v1/state/${connection.clientId}`, {
    method: "PUT",
    headers: { "content-type": "application/json", authorization: `Bearer ${await accessToken()}` },
    body: JSON.stringify({ state: localDraft, version: connection.version }),
  });
  const result = await response.json();
  if (response.status === 409) return { kind: "conflict", localDraft, remote: result.current };
  if (!response.ok) throw new Error(result.error ?? "State Port save failed.");
  saveConnection({ ...connection, version: result.application.version });
  return { kind: "saved", unchanged: result.unchanged, version: result.application.version };
}

export function useStatePortRemote(remote: RemoteState): RestoreSummary {
  const summary = restoreBackup(remote.state);
  const connection = requireConnection();
  saveConnection({ ...connection, version: remote.version });
  return summary;
}

export async function forceStatePortLocal(localDraft: BackupFile) {
  const connection = requireConnection();
  const response = await fetch(`${apiUrl}/v1/state/${connection.clientId}/force`, {
    method: "PUT",
    headers: { "content-type": "application/json", authorization: `Bearer ${await accessToken()}` },
    body: JSON.stringify({ state: localDraft }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "State Port force overwrite failed.");
  saveConnection({ ...connection, version: result.application.version });
  return result.application.version as number;
}

export function disconnectStatePort() {
  localStorage.removeItem(connectionKey);
  sessionStorage.removeItem(pendingKey);
  access = null;
}

async function accessToken(): Promise<string> {
  if (access && access.expiresAt > Date.now() + 30_000) return access.token;
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = refreshAccess().finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}

async function refreshAccess() {
  const connection = requireConnection();
  const tokens = await requestTokens(connection.clientId, {
    grantType: "refresh_token", clientId: connection.clientId, refreshToken: connection.refreshToken,
  });
  saveConnection({ ...connection, refreshToken: tokens.refreshToken, refreshExpiresAt: tokens.refreshExpiresAt });
  access = { token: tokens.accessToken, expiresAt: Date.now() + tokens.expiresIn * 1000 };
  return tokens.accessToken;
}

async function requestTokens(clientId: string, body: object): Promise<TokenResponse> {
  const response = await fetch(`${apiUrl}/v1/connect/token?client_id=${encodeURIComponent(clientId)}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error === "invalid_grant" ? "State Port connection expired or was revoked. Connect again." : "State Port connection failed.");
  return result;
}

async function readWithAccess(clientId: string, token: string): Promise<RemoteState> {
  const response = await fetch(`${apiUrl}/v1/state/${clientId}`, { headers: { authorization: `Bearer ${token}` } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "State Port load failed.");
  return result;
}

function requireConnection() {
  const connection = getStatePortConnection();
  if (!connection) throw new Error("Connect State Port first.");
  return connection;
}

function saveConnection(connection: Connection) {
  localStorage.setItem(connectionKey, JSON.stringify(connection));
}

function base64url(value: ArrayBuffer | Uint8Array) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
