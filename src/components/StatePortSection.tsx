import { useState } from "react";
import { Cloud, Link, Loader2, LogOut, RefreshCw, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/stores/toast";
import {
  beginStatePortConnect,
  disconnectStatePort,
  forceStatePortLocal,
  getStatePortConnection,
  loadStatePortRemote,
  saveStatePortLocal,
  useStatePortRemote,
  type SaveResult,
} from "@/lib/statePort";

export function StatePortSection() {
  const [clientId, setClientId] = useState(getStatePortConnection()?.clientId ?? "");
  const [connected, setConnected] = useState(Boolean(getStatePortConnection()));
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<Extract<SaveResult, { kind: "conflict" }> | null>(null);

  const run = async (label: string, action: () => Promise<void>) => {
    setBusyAction(label);
    setError(null);
    try { await action(); } catch (error) {
      const message = error instanceof Error ? error.message : "State Port request failed";
      setError(message);
      toast(message, "error");
    } finally { setBusyAction(null); }
  };

  return <div className="space-y-3 rounded-lg border border-primary/25 bg-primary/5 p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2"><Cloud className="h-4 w-4 text-primary" /><Label>State Port Sync</Label></div>
      {connected && <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">Connected</span>}
    </div>
    <p className="text-xs leading-relaxed text-muted-foreground">
      Save or load the complete Watch Bridge configuration using your local State
      Port service. This includes the TMDB key and is not end-to-end encrypted.
    </p>
    {!connected ? <div className="space-y-2">
      <Label htmlFor="state-port-client-id" className="text-xs">Public client ID</Label>
      <Input id="state-port-client-id" value={clientId} disabled={Boolean(busyAction)} onChange={(event) => setClientId(event.target.value.trim())} placeholder="Paste the State Port client ID" className="font-mono" />
      <Button size="sm" variant="default" disabled={!clientId || Boolean(busyAction)} onClick={() => void run("Connecting", async () => beginStatePortConnect(clientId))}>
        {busyAction === "Connecting" ? <Loader2 className="animate-spin" /> : <Link className="h-4 w-4" />}
        {busyAction === "Connecting" ? "Connecting…" : "Connect to State Port"}
      </Button>
    </div> : <>
      <p className="break-all font-mono text-[11px] text-muted-foreground">Connected client: {clientId}</p>
      {!conflict ? <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={Boolean(busyAction)} onClick={() => void run("Saving", async () => {
          const result = await saveStatePortLocal();
          if (result.kind === "conflict") setConflict(result);
          else toast(result.unchanged ? "Remote state is already current" : `Saved remote version ${result.version}`, "success");
        })}>{busyAction === "Saving" ? <Loader2 className="animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {busyAction === "Saving" ? "Saving…" : "Save Local Configuration"}</Button>
        <Button size="sm" variant="outline" disabled={Boolean(busyAction)} onClick={() => void run("Loading", async () => {
          const summary = await loadStatePortRemote();
          toast(`Loaded ${summary.library} titles and ${summary.actions} actions`, "success");
        })}>{busyAction === "Loading" ? <Loader2 className="animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {busyAction === "Loading" ? "Loading…" : "Load Remote Configuration"}</Button>
        <Button size="sm" variant="ghost" disabled={Boolean(busyAction)} onClick={() => { disconnectStatePort(); setConnected(false); setError(null); }}>
          <LogOut className="h-4 w-4" />Disconnect
        </Button>
      </div> : <div className="rounded-lg border border-destructive/40 p-3 text-xs">
        <p className="mb-3"><strong>Version conflict.</strong> Your local configuration is preserved. Choose which whole document to keep.</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={Boolean(busyAction)} onClick={() => void run("Loading remote", async () => {
            useStatePortRemote(conflict.remote); setConflict(null); toast("Loaded the latest remote configuration", "success");
          })}>{busyAction === "Loading remote" && <Loader2 className="animate-spin" />}Use Remote Configuration</Button>
          <Button size="sm" variant="destructive" disabled={Boolean(busyAction)} onClick={() => void run("Force saving", async () => {
            const version = await forceStatePortLocal(conflict.localDraft); setConflict(null); toast(`Force-saved remote version ${version}`, "success");
          })}>{busyAction === "Force saving" && <Loader2 className="animate-spin" />}Force Overwrite with Local</Button>
        </div>
      </div>}
    </>}
    {error && <p role="alert" aria-live="polite" className="text-xs text-destructive">{error}</p>}
  </div>;
}
