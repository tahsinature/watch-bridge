import { toast } from "@/stores/toast";
import { resolveTemplate, type ActionContext } from "@/lib/placeholders";
import type { ActionDef } from "@/types";

/**
 * Execute a configurable action against the selected title's context.
 * All side effects are client-only: opening tabs, custom-scheme deep links,
 * clipboard writes, or (for HTTPS/CORS endpoints) direct fetch requests.
 */
export async function runAction(
  action: ActionDef,
  ctx: ActionContext,
): Promise<void> {
  // Common failure: template needs an IMDb id but this title has none.
  if (action.template.includes("{imdbId}") && !ctx.imdbId) {
    toast("No IMDb id available for this title", "error");
    return;
  }

  const resolved = await resolveTemplate(action.template, ctx);

  switch (action.type) {
    case "open-url":
      window.open(resolved, "_blank", "noopener,noreferrer");
      break;

    case "deep-link":
      openExternal(resolved);
      toast(`Launching ${action.name}…`);
      break;

    case "copy":
      await navigator.clipboard.writeText(resolved);
      toast("Copied to clipboard", "success");
      break;

    case "http-request": {
      const body =
        action.method === "POST" && action.body
          ? await resolveTemplate(action.body, ctx)
          : undefined;
      await runHttpRequest(action, resolved, body);
      break;
    }
  }
}

/** Trigger a custom-scheme link (e.g. app://…) without navigating away. */
function openExternal(url: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function parseHeaders(raw?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!raw) return headers;
  for (const line of raw.split("\n")) {
    const index = line.indexOf(":");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (key) headers[key] = value;
  }
  return headers;
}

async function runHttpRequest(
  action: ActionDef,
  url: string,
  body?: string,
): Promise<void> {
  const method = action.method ?? "GET";
  try {
    const res = await fetch(url, {
      method,
      headers: parseHeaders(action.headers),
      body: method === "POST" ? body : undefined,
    });
    toast(
      `${action.name}: ${res.status} ${res.ok ? "OK" : res.statusText}`,
      res.ok ? "success" : "error",
    );
  } catch {
    toast(`${action.name} failed — endpoint blocked or unreachable`, "error");
  }
}
