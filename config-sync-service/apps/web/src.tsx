import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
type Application = { id: string; name: string; state: unknown; version: number; clientId: string; redirectUris: string[] };
type Connection = { id: string; lastUsedAt: string; expiresAt: string; revokedAt: string | null };
const authHeaders = (token: string) => ({ "content-type": "application/json", authorization: `Bearer ${token}` });

function Dashboard() {
  const [token, setToken] = useState(localStorage.token ?? "");
  const [apps, setApps] = useState<Application[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const params = new URLSearchParams(location.search);
  const connectRequest = params.has("client_id") ? {
    clientId: params.get("client_id") ?? "", redirectUri: params.get("redirect_uri") ?? "",
    codeChallenge: params.get("code_challenge") ?? "", state: params.get("state") ?? undefined,
    scopes: (params.get("scope") ?? "state:read state:write").split(" "),
  } : null;
  const load = () => fetch(`${API}/v1/apps`, { headers: authHeaders(token) }).then((response) => response.json()).then(setApps);
  useEffect(() => { if (token) load(); }, [token]);
  const authenticate = async (path: string) => {
    const response = await fetch(`${API}/v1/auth/${path}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }),
    });
    const body = await response.json();
    if (body.token) { localStorage.token = body.token; setToken(body.token); } else alert(body.error);
  };
  if (!token) return <main><h1>state-port</h1><p>Sign in to manage or approve application connections.</p>
    <input placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
    <input placeholder="Password (10+ characters)" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
    <div><button onClick={() => authenticate("signup")}>Create account</button><button onClick={() => authenticate("login")}>Sign in</button></div>
  </main>;
  if (connectRequest) return <ConnectApproval request={connectRequest} token={token} />;
  return <main><header><h1>state-port applications</h1><button onClick={() => { delete localStorage.token; setToken(""); }}>Sign out</button></header>
    <button onClick={async () => {
      const name = prompt("Application name"); if (!name) return;
      const redirectUri = prompt("Exact frontend callback URL", "http://localhost:5173/callback"); if (!redirectUri) return;
      await fetch(`${API}/v1/apps`, { method: "POST", headers: authHeaders(token), body: JSON.stringify({ name, state: {}, redirectUris: [redirectUri] }) }); load();
    }}>New application</button>
    {apps.map((application) => <Editor key={application.id} app={application} token={token} onSaved={load} />)}
  </main>;
}

function ConnectApproval({ request, token }: { request: { clientId: string; redirectUri: string; codeChallenge: string; state?: string; scopes: string[] }; token: string }) {
  const approve = async () => {
    const response = await fetch(`${API}/v1/connect/authorize`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(request) });
    const body = await response.json();
    if (!response.ok) return alert(body.error);
    location.assign(body.redirectTo);
  };
  return <main><h1>Connect application</h1><p>This application requests access to your stored state.</p>
    <p><strong>Redirect:</strong> {request.redirectUri}</p><p><strong>Scopes:</strong> {request.scopes.join(", ")}</p>
    <button onClick={approve}>Allow connection</button><button onClick={() => { location.href = "/"; }}>Cancel</button>
  </main>;
}

const equalJson = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => equalJson(value, b[index]));
  const left = a as Record<string, unknown>, right = b as Record<string, unknown>, keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every((key) => Object.prototype.hasOwnProperty.call(right, key) && equalJson(left[key], right[key]));
};

function Editor({ app, token, onSaved }: { app: Application; token: string; onSaved: () => void }) {
  const [text, setText] = useState(JSON.stringify(app.state, null, 2));
  const [conflict, setConflict] = useState<Application | null>(null);
  const save = async () => {
    let state; try { state = JSON.parse(text); } catch { return alert("State must be valid JSON"); }
    if (equalJson(state, app.state)) return alert("No changes to save.");
    const response = await fetch(`${API}/v1/apps/${app.id}/state`, { method: "PUT", headers: authHeaders(token), body: JSON.stringify({ state, version: app.version }) });
    if (response.status === 409) {
      const body = await response.json();
      setConflict(body.current);
    } else onSaved();
  };
  const useRemote = () => {
    if (!conflict) return;
    setText(JSON.stringify(conflict.state, null, 2));
    setConflict(null);
    onSaved();
  };
  const forceOverwrite = async () => {
    let state; try { state = JSON.parse(text); } catch { return alert("State must be valid JSON"); }
    await fetch(`${API}/v1/apps/${app.id}/state/force`, {
      method: "PUT", headers: authHeaders(token), body: JSON.stringify({ state }),
    });
    setConflict(null);
    onSaved();
  };
  const editRedirects = async () => {
    const value = prompt("Exact redirect URLs, one per line", app.redirectUris.join("\n")); if (value === null) return;
    await fetch(`${API}/v1/apps/${app.id}/client`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify({ redirectUris: value.split("\n").map((item) => item.trim()).filter(Boolean) }) });
    onSaved();
  };
  return <section><h2>{app.name} <small>v{app.version}</small></h2>
    <p><strong>Public client ID:</strong> <code>{app.clientId}</code></p><p><strong>Redirects:</strong> {app.redirectUris.join(", ") || "none"}</p>
    <button onClick={editRedirects}>Edit redirects</button>
    <textarea value={text} onChange={(event) => setText(event.target.value)} />
    {conflict ? <div><p><strong>Version conflict.</strong> Your local draft is preserved. Remote version: {conflict.version}.</p>
      <button onClick={useRemote}>Use remote state</button><button onClick={forceOverwrite}>Force overwrite with local draft</button></div>
      : <button onClick={save}>Save now</button>}
    <Connections appId={app.id} token={token} />
  </section>;
}

function Connections({ appId, token }: { appId: string; token: string }) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const load = () => fetch(`${API}/v1/apps/${appId}/connections`, { headers: authHeaders(token) }).then((response) => response.json()).then(setConnections);
  useEffect(load, [appId]);
  return <div><h3>Connections</h3>{connections.filter((item) => !item.revokedAt).map((connection) =>
    <p key={connection.id}>Last used {new Date(connection.lastUsedAt).toLocaleString()} · expires {new Date(connection.expiresAt).toLocaleDateString()}{" "}
      <button onClick={async () => { await fetch(`${API}/v1/apps/${appId}/connections/${connection.id}`, { method: "DELETE", headers: authHeaders(token) }); load(); }}>Revoke</button></p>)}
    {!connections.some((item) => !item.revokedAt) && <p>No active connections.</p>}</div>;
}

createRoot(document.getElementById("root")!).render(<Dashboard />);
