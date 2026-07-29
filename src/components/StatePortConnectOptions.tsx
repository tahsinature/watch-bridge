import { useEffect, useRef, useState } from "react";
import { ExternalLink, Gamepad2, Link, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getBuiltInStatePortClientId,
  pollStatePortDeviceCode,
  requestStatePortDeviceCode,
  type DeviceAuthorization,
} from "@/lib/statePort";
import { toast } from "@/stores/toast";

interface Props {
  disabled: boolean;
  onBrowserConnect: (clientId?: string) => Promise<void>;
  onDeviceConnected: (clientId: string) => void;
}

export function StatePortConnectOptions({
  disabled,
  onBrowserConnect,
  onDeviceConnected,
}: Props) {
  const [customClientId, setCustomClientId] = useState("");
  const [deviceRequest, setDeviceRequest] = useState<DeviceAuthorization | null>(null);
  const [deviceStatus, setDeviceStatus] = useState("");
  const [deviceError, setDeviceError] = useState("");
  const [startingDevice, setStartingDevice] = useState(false);
  const pollController = useRef<AbortController | null>(null);

  useEffect(() => () => pollController.current?.abort(), []);

  const cancelDeviceConnect = () => {
    pollController.current?.abort();
    pollController.current = null;
    setDeviceRequest(null);
    setDeviceStatus("");
    setDeviceError("");
  };

  const startDeviceConnect = async () => {
    cancelDeviceConnect();
    const controller = new AbortController();
    pollController.current = controller;
    setStartingDevice(true);
    try {
      const authorization = await requestStatePortDeviceCode(undefined, controller.signal);
      if (controller.signal.aborted) return;
      setDeviceRequest(authorization);
      setDeviceStatus("Waiting for approval…");
      void pollStatePortDeviceCode(authorization, controller.signal, setDeviceStatus)
        .then(() => {
          pollController.current = null;
          onDeviceConnected(authorization.clientId);
        })
        .catch((error) => {
          if (controller.signal.aborted && Date.now() < authorization.expiresAt) return;
          setDeviceError(error instanceof Error ? error.message : "Device sign-in failed.");
        });
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = error instanceof Error ? error.message : "Could not start device sign-in.";
      setDeviceError(message);
      toast(message, "error");
    } finally {
      if (!controller.signal.aborted) setStartingDevice(false);
    }
  };

  if (deviceRequest) {
    return (
      <div className="space-y-3 rounded-md border border-primary/30 bg-background/80 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Approve on a phone or computer</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Open the verification page, sign in, and confirm this one-time code.
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Cancel device sign-in"
            onClick={cancelDeviceConnect}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-center">
          <p className="font-mono text-2xl font-semibold tracking-[0.18em] text-foreground">
            {deviceRequest.userCode}
          </p>
          <p className="mt-1 break-all text-xs text-muted-foreground">
            {deviceRequest.verificationUri}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" asChild>
            <a href={deviceRequest.verificationUriComplete} target="_blank" rel="noreferrer">
              Open verification page <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          {!deviceError ? <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" role="status">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {deviceStatus}
          </span> : null}
        </div>
        {deviceError ? <p className="text-xs text-destructive" role="alert">{deviceError}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => void onBrowserConnect()}
        >
          {disabled ? <Loader2 className="animate-spin" /> : <Link className="h-4 w-4" />}
          Sign in with State Port
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || startingDevice}
          onClick={() => void startDeviceConnect()}
        >
          {startingDevice ? <Loader2 className="animate-spin" /> : <Gamepad2 className="h-4 w-4" />}
          Use a TV or console code
        </Button>
      </div>
      {deviceError ? <p className="text-xs text-destructive" role="alert">{deviceError}</p> : null}
      <details className="rounded-md border border-border/70 bg-background/50 px-3 py-2">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
          Advanced / self-hosted client
        </summary>
        <div className="mt-3 space-y-2">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Override the built-in public Watch Bridge identity only when your State Port
            administrator gave you a separate client ID.
          </p>
          <Label htmlFor="state-port-client-id" className="text-xs">Public client ID override</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="state-port-client-id"
              value={customClientId}
              disabled={disabled}
              onChange={(event) => setCustomClientId(event.target.value.trim())}
              placeholder={getBuiltInStatePortClientId()}
              className="font-mono text-xs"
            />
            <Button
              size="sm"
              variant="secondary"
              disabled={disabled || !customClientId}
              onClick={() => void onBrowserConnect(customClientId)}
            >
              Sign in with override
            </Button>
          </div>
        </div>
      </details>
    </div>
  );
}
