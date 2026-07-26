import { useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTION_ICON_NAMES, actionIcon } from "@/lib/icons";
import { PLACEHOLDERS } from "@/lib/placeholders";
import { cn } from "@/lib/utils";
import type { ActionDef, ActionGroup, ActionType } from "@/types";

interface ActionEditorProps {
  initial: ActionDef | null;
  onSave: (action: ActionDef) => void;
  onCancel: () => void;
}

const TYPE_OPTIONS: { value: ActionType; label: string; hint: string }[] = [
  { value: "open-url", label: "Open URL", hint: "Open a link in a new tab" },
  { value: "copy", label: "Copy text", hint: "Copy filled template to clipboard" },
  { value: "deep-link", label: "Deep link", hint: "Launch a native app (app://…)" },
  { value: "http-request", label: "HTTP request", hint: "GET/POST to an endpoint" },
];

const GROUP_OPTIONS: ActionGroup[] = ["download", "search", "record", "custom"];

function blankAction(): ActionDef {
  return {
    id: crypto.randomUUID(),
    name: "",
    icon: "Zap",
    type: "open-url",
    group: "custom",
    template: "",
    enabled: true,
  };
}

export function ActionEditor({ initial, onSave, onCancel }: ActionEditorProps) {
  const [draft, setDraft] = useState<ActionDef>(initial ?? blankAction());
  const templateRef = useRef<HTMLTextAreaElement>(null);

  const set = <K extends keyof ActionDef>(key: K, value: ActionDef[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const insertToken = (token: string) => {
    const el = templateRef.current;
    const current = draft.template;
    if (!el) {
      set("template", current + token);
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const next = current.slice(0, start) + token + current.slice(end);
    set("template", next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + token.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const canSave = draft.name.trim().length > 0 && draft.template.trim().length > 0;
  const isHttp = draft.type === "http-request";

  return (
    <div className="space-y-4">
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to actions
      </button>

      {/* Name + icon */}
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="action-name">Name</Label>
          <Input
            id="action-name"
            value={draft.name}
            placeholder="e.g. Send to NAS"
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Icon</Label>
          <IconPicker value={draft.icon} onChange={(icon) => set("icon", icon)} />
        </div>
      </div>

      {/* Type + group */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select
            value={draft.type}
            onValueChange={(v) => set("type", v as ActionType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Group</Label>
          <Select
            value={draft.group}
            onValueChange={(v) => set("group", v as ActionGroup)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GROUP_OPTIONS.map((g) => (
                <SelectItem key={g} value={g} className="capitalize">
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Template */}
      <div className="space-y-1.5">
        <Label htmlFor="action-template">
          {draft.type === "copy" ? "Text template" : "URL template"}
        </Label>
        <Textarea
          id="action-template"
          ref={templateRef}
          value={draft.template}
          spellCheck={false}
          placeholder={
            isHttp
              ? "https://your-nas.local:5001/webapi/entry.cgi"
              : "https://example.com/search?imdb_id={imdbId}"
          }
          onChange={(e) => set("template", e.target.value)}
          className="font-mono text-xs"
        />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {PLACEHOLDERS.map((p) => (
            <button
              key={p.token}
              type="button"
              onClick={() => insertToken(p.token)}
              title={p.description}
              className="rounded-md border border-border bg-secondary/50 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {p.token}
            </button>
          ))}
        </div>
      </div>

      {/* HTTP-specific fields */}
      {isHttp && (
        <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-3">
          <div className="space-y-1.5">
            <Label>Method</Label>
            <Select
              value={draft.method ?? "GET"}
              onValueChange={(v) => set("method", v as "GET" | "POST")}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="action-headers">Headers (one per line)</Label>
            <Textarea
              id="action-headers"
              value={draft.headers ?? ""}
              spellCheck={false}
              placeholder="Authorization: Bearer …"
              onChange={(e) => set("headers", e.target.value)}
              className="min-h-[52px] font-mono text-xs"
            />
          </div>
          {draft.method === "POST" && (
            <div className="space-y-1.5">
              <Label htmlFor="action-body">Body</Label>
              <Textarea
                id="action-body"
                value={draft.body ?? ""}
                spellCheck={false}
                placeholder="uri={clipboardEncoded}"
                onChange={(e) => set("body", e.target.value)}
                className="min-h-[52px] font-mono text-xs"
              />
            </div>
          )}
        </div>
      )}

      {/* Confirm toggle */}
      <label className="flex items-center justify-between rounded-lg border border-border p-3">
        <span className="text-sm">
          Ask for confirmation before running
          <span className="block text-xs text-muted-foreground">
            Recommended for HTTP requests that trigger downloads.
          </span>
        </span>
        <Switch
          checked={!!draft.confirm}
          onCheckedChange={(v) => set("confirm", v)}
        />
      </label>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!canSave} onClick={() => onSave(draft)}>
          {initial ? "Save changes" : "Add action"}
        </Button>
      </div>
    </div>
  );
}

function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  return (
    <div className="flex max-w-[220px] flex-wrap gap-1 rounded-lg border border-border bg-secondary/30 p-1.5">
      {ACTION_ICON_NAMES.map((name) => {
        const Icon = actionIcon(name);
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            title={name}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-md transition-colors",
              value === name
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
